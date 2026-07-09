import { isChatBusy as isChatStreaming, openChat } from '../../lib/chat';
import { buildTaskPayload, resolveEndpoint } from '../../lib/tasks';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  noop,
  safelyRunOnBrowser,
  warning,
} from '../../lib/utils';

import type { TaskTransport } from '../../lib/tasks';
import type {
  Connector,
  Hit,
  IndexRenderState,
  InitOptions,
  InstantSearch,
  RenderOptions,
  WidgetRenderState,
} from '../../types';
import type { ChatRenderState } from '../chat/connectChat';
import type { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat-page-suggestions',
  connector: true,
});

const RENDER_STATE_KEY = 'chatPageSuggestions' as const;
const CHAT_RENDER_STATE_KEY = 'chat' as const;
const DEBOUNCE_MS = 300;
const DEFAULT_SSR_TIMEOUT_MS = 150;

/**
 * The default Algolia-owned task ID for on-page prompt suggestions. Server
 * config (agent `config.tasks[<id>]`) owns the instructions, input schema, and
 * output schema; the client only selects the task and supplies `input`.
 */
const DEFAULT_TASK_ID = 'algolia_on_page_suggestions';

/**
 * Page-type discriminator forwarded to the task as `input.pageType`. `'pdp'` /
 * `'plp'` are the documented cases; any string is accepted since the task's
 * input schema is server-owned.
 */
export type ChatPageSuggestionsPageType = 'pdp' | 'plp' | (string & {});

/**
 * Extracts the suggestion strings from an Agent Studio `tasks` response.
 * Expected shape: `{ output: { suggestions: string[] } }`. The server caps the
 * count via the task's output schema, so we only filter to non-empty strings;
 * any malformed response yields `[]`.
 */
function parseSuggestions(data: unknown): string[] {
  const suggestions = (
    data as { output?: { suggestions?: unknown[] } } | null | undefined
  )?.output?.suggestions;

  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions.filter(
    (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0
  );
}

type InstantSearchWithChatStates = InstantSearch & {
  _initialChatStates: Record<string, unknown> | null;
};

type ChatPageSuggestionsSnapshot = {
  suggestions: string[];
};

function isServerRendering(): boolean {
  return safelyRunOnBrowser(() => false, { fallback: () => true });
}

// Per-InstantSearch SSR wait promise cache. Two-pass SSR (e.g. React) renders
// the tree twice on the server; reuse the in-flight fetch across passes
// rather than firing it twice.
const serverWaitRegistry = new WeakMap<InstantSearch, Promise<void>>();

/**
 * Custom transport for the page-suggestions task request. Alias of the generic
 * `TaskTransport` — kept under this name for API stability.
 */
export type ChatPageSuggestionsTransport = TaskTransport;

/**
 * Metadata passed to `transformItems`.
 */
export type ChatPageSuggestionsTransformItemsMetadata = {
  query: string;
  results: SearchResults | null;
};

/**
 * Custom `transformItems` signature for `connectChatPageSuggestions`.
 */
export type ChatPageSuggestionsTransformItems = (
  items: string[],
  metadata: ChatPageSuggestionsTransformItemsMetadata
) => string[];

/**
 * Hit transformer — receives every hit from the current results and returns
 * the subset (or reshaped objects) to forward to the agent as context.
 */
export type ChatPageSuggestionsTransformHits = (hits: Hit[]) => unknown[];

export type ChatPageSuggestionsRenderState = {
  /**
   * Backend-generated prompt strings rendered as clickable pills.
   */
  suggestions: string[];
  /**
   * Whether suggestions are currently being fetched.
   */
  isLoading: boolean;
  /**
   * Default click handler. Calls `sendToChat(prompt)`. Override at the widget
   * level via the `onSuggestionClick` prop if you need analytics, custom
   * routing, or a fallback when no chat widget is mounted.
   */
  onSuggestionClick: (prompt: string) => void;
  /**
   * Attempts to hand off the prompt to the `connectChat` widget on the same
   * index. Returns `true` if a chat widget was found and the message was
   * dispatched, `false` otherwise — useful for fall-through to a
   * non-InstantSearch chat.
   */
  sendToChat: (prompt: string) => boolean;
  /**
   * Imperative refetch that bypasses the debounce. No-op while there are no
   * results or while another fetch is in-flight.
   */
  refresh: () => void;
  /**
   * Whether the chat widget is currently busy (mid-stream) or absent. Surface
   * as `disabled` on your pills UI so callers don't queue clicks while the
   * chat is answering. Optimistically `false` before the chat widget has
   * mounted, so pills aren't disabled on first paint.
   */
  isChatBusy: boolean;
};

/**
 * Either `agentId` or a custom `transport` is required.
 */
export type ChatPageSuggestionsSource =
  | {
      /**
       * The ID of the agent configured in the Algolia dashboard.
       */
      agentId: string;
      transport?: never;
    }
  | {
      /**
       * Custom transport configuration. When provided, `agentId` and the
       * Algolia client credentials are ignored.
       */
      transport: ChatPageSuggestionsTransport;
      agentId?: never;
    };

export type ChatPageSuggestionsConnectorParams = ChatPageSuggestionsSource & {
  /**
   * The server-owned Agent Studio task to invoke. The task's instructions,
   * input schema, and output schema live in the agent config, not here.
   * @default 'algolia_on_page_suggestions'
   */
  task?: string;
  /**
   * Page type forwarded to the task as `input.pageType`. Defaults to `'pdp'`
   * when `context` is provided, otherwise `'plp'`. Override to label the page
   * explicitly (the backend uses it to pick the right prompt).
   */
  pageType?: ChatPageSuggestionsPageType;
  /**
   * Transform the current results' hits before they're forwarded to the agent
   * as context. Useful for trimming payload size (drop big fields) or
   * stripping sensitive data. Defaults to the first 5 hits unmodified.
   *
   * Ignored when `context` is provided — in that mode the widget sends only
   * the context object and skips auto-extraction entirely.
   */
  transformHits?: ChatPageSuggestionsTransformHits;
  /**
   * Page context sent to the agent. When provided, the widget skips
   * auto-extracting `{ query, hitsSample }` from the current search results
   * and sends *only* the context object — use this for PDPs, marketing
   * pages, or anywhere the search state isn't the right signal. Either an
   * object or a function returning one (called per fetch).
   *
   * When omitted, the widget defaults to PLP behavior and auto-sends
   * `{ query, hitsSample }` derived from the InstantSearch results.
   */
  context?: Record<string, unknown> | (() => Record<string, unknown>);
  /**
   * Transform the parsed list before exposing it. Receives the parsed
   * suggestions and `{ query, results }` from the current search.
   */
  transformItems?: ChatPageSuggestionsTransformItems;
  /**
   * Maximum time (in ms) the InstantSearch SSR pipeline waits for the agent
   * response before flushing the page. On timeout the server resolves
   * without seeding suggestions and the client refetches after hydration.
   * @default 150
   */
  ssrTimeout?: number;
};

export type ChatPageSuggestionsWidgetDescription = {
  $$type: 'ais.chatPageSuggestions';
  renderState: ChatPageSuggestionsRenderState;
  indexRenderState: {
    chatPageSuggestions: WidgetRenderState<
      ChatPageSuggestionsRenderState,
      ChatPageSuggestionsConnectorParams
    >;
  };
};

export type ChatPageSuggestionsConnector = Connector<
  ChatPageSuggestionsWidgetDescription,
  ChatPageSuggestionsConnectorParams
>;

const DEFAULT_TRANSFORM_HITS: ChatPageSuggestionsTransformHits = (hits) =>
  hits.slice(0, 5);

const IDENTITY_TRANSFORM: ChatPageSuggestionsTransformItems = (items) => items;

const connectChatPageSuggestions: ChatPageSuggestionsConnector =
  function connectChatPageSuggestions(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      warning(
        false,
        'ChatPageSuggestions is not yet stable and will change in the future.'
      );

      const {
        agentId,
        task,
        pageType,
        transformHits = DEFAULT_TRANSFORM_HITS,
        context,
        transformItems = IDENTITY_TRANSFORM,
        transport,
        ssrTimeout = DEFAULT_SSR_TIMEOUT_MS,
      } = widgetParams;

      if (!agentId && !transport) {
        throw new Error(
          withUsage(
            'The `agentId` option is required unless a custom `transport` is provided.'
          )
        );
      }

      let endpoint: string;
      let headers: Record<string, string>;
      let suggestions: string[] = [];
      let isLoading = false;
      let inFlight = false;
      let debounceTimer: ReturnType<typeof setTimeout> | undefined;
      let lastStateSignature: string | null = null;
      let searchHelper: InitOptions['helper'] | null = null;
      let latestRenderOptions: RenderOptions | null = null;
      // Set when SSR seeded suggestions; first post-hydration `render()` skips
      // its fetch (it just seeds the state signature) so the client doesn't
      // immediately overwrite the server snapshot.
      let hydratedFromSnapshot = false;
      let hydrationAttempted = false;

      const hydrateFromSnapshot = (
        instantSearchInstance: InstantSearch
      ): void => {
        if (hydrationAttempted) return;
        hydrationAttempted = true;
        const states = (instantSearchInstance as InstantSearchWithChatStates)
          ._initialChatStates;
        const snapshot = states?.[RENDER_STATE_KEY] as
          | ChatPageSuggestionsSnapshot
          | undefined;
        if (snapshot && Array.isArray(snapshot.suggestions)) {
          suggestions = snapshot.suggestions;
          hydratedFromSnapshot = true;
        }
      };

      const getStateSignature = (results: SearchResults): string => {
        const query = results.query || '';
        const refinements = searchHelper
          ? JSON.stringify(searchHelper.state.facetsRefinements) +
            JSON.stringify(searchHelper.state.disjunctiveFacetsRefinements) +
            JSON.stringify(searchHelper.state.hierarchicalFacetsRefinements)
          : '';
        return `${query}|${refinements}`;
      };

      const getChatRenderState = (
        renderOptions: InitOptions | RenderOptions
      ): Partial<ChatRenderState> | undefined => {
        const { instantSearchInstance, parent } = renderOptions;
        const indexId = parent ? parent.getIndexId() : '';
        if (!indexId || !instantSearchInstance.renderState?.[indexId]) {
          return undefined;
        }
        return instantSearchInstance.renderState[indexId][
          CHAT_RENDER_STATE_KEY
        ] as Partial<ChatRenderState> | undefined;
      };

      const sendToChat =
        (renderOptions: InitOptions | RenderOptions) =>
        (prompt: string): boolean => {
          const chatRenderState = getChatRenderState(renderOptions);
          if (!chatRenderState || !chatRenderState.sendMessage) {
            if (__DEV__) {
              warning(
                false,
                `No chat widget found in render state. Make sure a \`connectChat\` widget is mounted on the same index, or pass an \`onSuggestionClick\` prop to handle the click yourself.`
              );
            }
            return false;
          }
          openChat(chatRenderState, {
            message: prompt,
            referer: 'page-suggestions',
          });
          return true;
        };

      const doFetch = (results: SearchResults): Promise<string[]> => {
        const resolvedContext =
          typeof context === 'function' ? context() : context;
        const resolvedPageType =
          pageType ?? (resolvedContext ? 'pdp' : 'plp');
        // PDP mode: caller-supplied context replaces auto-extraction.
        // PLP mode (default): build the input from the current search state.
        const input: Record<string, unknown> = resolvedContext
          ? { pageType: resolvedPageType, ...resolvedContext }
          : {
              pageType: resolvedPageType,
              query: results.query || '',
              hitsSample: transformHits(results.hits as Hit[]),
            };
        const finalPayload = buildTaskPayload({
          task: task ?? DEFAULT_TASK_ID,
          input,
          prepareRequest: transport?.prepareSendMessagesRequest,
        });
        return fetch(endpoint, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
          })
          .then((data) => parseSuggestions(data));
      };

      const fetchAndRender = (
        results: SearchResults,
        renderOptions: RenderOptions
      ) => {
        // In PLP mode (no caller context) we need hits to send the agent any
        // useful signal. In PDP mode (context provided) the context itself
        // is the signal, so we proceed even with empty hits.
        const hasContext = context !== undefined;
        if (!hasContext && !results?.hits?.length) {
          suggestions = [];
          isLoading = false;
          inFlight = false;
          renderFn(
            {
              ...getWidgetRenderState(renderOptions),
              instantSearchInstance: renderOptions.instantSearchInstance,
            },
            false
          );
          return;
        }

        isLoading = true;
        inFlight = true;
        renderFn(
          {
            ...getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );

        doFetch(results)
          .then((next) => {
            suggestions = next;
          })
          .catch(() => {
            suggestions = [];
          })
          .finally(() => {
            isLoading = false;
            inFlight = false;
            renderFn(
              {
                ...getWidgetRenderState(renderOptions),
                instantSearchInstance: renderOptions.instantSearchInstance,
              },
              false
            );
          });
      };

      const refresh = () => {
        if (inFlight) return;
        const results = latestRenderOptions?.results;
        if (!results || !latestRenderOptions) return;
        clearTimeout(debounceTimer);
        lastStateSignature = getStateSignature(results);
        fetchAndRender(results, latestRenderOptions);
      };

      const buildServerWait = (
        instantSearchInstance: InstantSearch
      ): Promise<void> => {
        return new Promise<void>((resolve) => {
          let settled = false;
          const settle = () => {
            if (settled) return;
            settled = true;
            resolve();
          };

          const timer = setTimeout(settle, ssrTimeout);

          // `mainHelper.derivedHelpers[0]` is the helper that emits `result`
          // — the per-index helper passed to `init` doesn't.
          const derivedHelper =
            instantSearchInstance.mainHelper?.derivedHelpers?.[0];
          if (!derivedHelper) {
            clearTimeout(timer);
            settle();
            return;
          }

          const onResult = (event: { results?: SearchResults }) => {
            derivedHelper.removeListener('result', onResult);
            const results = event?.results;
            const hasContext = context !== undefined;
            // PLP mode without hits → nothing useful to ask the agent.
            if (!results || (!hasContext && !results.hits?.length)) {
              clearTimeout(timer);
              settle();
              return;
            }
            doFetch(results)
              .then((next) => {
                if (settled) return;
                suggestions = next;
                const target =
                  instantSearchInstance as InstantSearchWithChatStates;
                if (!target._initialChatStates) {
                  target._initialChatStates = {};
                }
                target._initialChatStates[RENDER_STATE_KEY] = {
                  suggestions: next,
                } satisfies ChatPageSuggestionsSnapshot;
              })
              .catch(() => {
                // Swallow — the client will refetch on hydration if the
                // server fetch failed.
              })
              .finally(() => {
                clearTimeout(timer);
                settle();
              });
          };
          derivedHelper.on('result', onResult);
        });
      };

      const getWidgetRenderState = (
        renderOptions: InitOptions | RenderOptions
      ): Omit<ChatPageSuggestionsRenderState, never> & {
        widgetParams: ChatPageSuggestionsConnectorParams;
      } => {
        // React's `useConnector` calls this before `init()` runs (via its
        // `useState` initializer). Hydrate the SSR snapshot here so the
        // first React render already shows the seeded suggestions.
        hydrateFromSnapshot(renderOptions.instantSearchInstance);

        const results =
          'results' in renderOptions ? renderOptions.results : undefined;
        const transformed = transformItems(suggestions, {
          query: results?.query || '',
          results: results || null,
        });

        const chatRenderState = getChatRenderState(renderOptions);

        // Optimistic when the chat widget hasn't been observed yet — by click
        // time it should be mounted and the click reads fresh state.
        const isChatBusy = chatRenderState
          ? !chatRenderState.sendMessage || isChatStreaming(chatRenderState)
          : false;

        const send = sendToChat(renderOptions);

        return {
          suggestions: transformed,
          isLoading,
          onSuggestionClick: send,
          sendToChat: send,
          refresh,
          isChatBusy,
          widgetParams,
        };
      };

      return {
        $$type: 'ais.chatPageSuggestions',

        init(initOptions) {
          const { instantSearchInstance, helper } = initOptions;
          searchHelper = helper;

          if (transport) {
            ({ endpoint, headers } = resolveEndpoint({ transport }));
          } else {
            const [appId, apiKey] = getAppIdAndApiKey(
              instantSearchInstance.client
            );

            if (!appId || !apiKey) {
              throw new Error(
                withUsage(
                  'Could not extract Algolia credentials from the search client.'
                )
              );
            }

            ({ endpoint, headers } = resolveEndpoint({
              appId,
              apiKey,
              agentId,
              algoliaAgent: getAlgoliaAgent(instantSearchInstance.client),
            }));
          }

          // Idempotent — `getWidgetRenderState()` may have already hydrated
          // from a pre-init `useState` initializer in React.
          hydrateFromSnapshot(instantSearchInstance);

          if (isServerRendering()) {
            let wait = serverWaitRegistry.get(instantSearchInstance);
            if (!wait) {
              wait = buildServerWait(instantSearchInstance);
              serverWaitRegistry.set(instantSearchInstance, wait);
            }
            instantSearchInstance.registerServerWait(wait);
          }

          renderFn(
            {
              ...getWidgetRenderState(initOptions),
              instantSearchInstance,
            },
            true
          );
        },

        render(renderOptions) {
          const { results, instantSearchInstance } = renderOptions;

          latestRenderOptions = renderOptions;

          if (!results) {
            renderFn(
              {
                ...getWidgetRenderState(renderOptions),
                instantSearchInstance,
              },
              false
            );
            return;
          }

          const stateSignature = getStateSignature(results);

          // First post-hydration render: seed the signature so future state
          // changes still trigger a refetch, but skip the immediate one so we
          // don't overwrite the server-seeded suggestions.
          if (hydratedFromSnapshot) {
            hydratedFromSnapshot = false;
            lastStateSignature = stateSignature;
            renderFn(
              {
                ...getWidgetRenderState(renderOptions),
                instantSearchInstance,
              },
              false
            );
            return;
          }

          if (stateSignature !== lastStateSignature) {
            lastStateSignature = stateSignature;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              if (latestRenderOptions?.results) {
                fetchAndRender(
                  latestRenderOptions.results,
                  latestRenderOptions
                );
              }
            }, DEBOUNCE_MS);
          }

          renderFn(
            {
              ...getWidgetRenderState(renderOptions),
              instantSearchInstance,
            },
            false
          );
        },

        dispose() {
          clearTimeout(debounceTimer);
          unmountFn();
        },

        getRenderState(
          renderState,
          renderOptions
        ): IndexRenderState &
          ChatPageSuggestionsWidgetDescription['indexRenderState'] {
          return {
            ...renderState,
            [RENDER_STATE_KEY]: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState(renderOptions) {
          return getWidgetRenderState(renderOptions);
        },
      };
    };
  };

export default connectChatPageSuggestions;
