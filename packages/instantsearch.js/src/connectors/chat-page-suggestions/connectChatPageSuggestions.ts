import { isChatBusy, openChat } from '../../lib/chat';
import {
  buildEndpoint,
  buildPayload,
  parseSuggestions,
} from '../../lib/standalone/chat-page-suggestions';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  noop,
  safelyRunOnBrowser,
  warning,
} from '../../lib/utils';

import type {
  Connector,
  IndexRenderState,
  InitOptions,
  InstantSearch,
  RenderOptions,
  TransformItems,
  WidgetRenderState,
} from '../../types';
import type { ChatRenderState } from '../chat/connectChat';
// Re-exported below so the symbol stays at its original public path.
import type { ChatPageSuggestionsTransport } from '../../lib/standalone/chat-page-suggestions';
import type { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat-page-suggestions',
  connector: true,
});

export type { ChatPageSuggestionsTransport };

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
   * Click handler that opens the main chat widget with the given prompt
   * already sent. No-ops when no `connectChat` widget is mounted with a
   * matching `chatType`.
   */
  onSuggestionClick: (prompt: string) => void;
  /**
   * Whether `onSuggestionClick` can submit. `false` when the main chat
   * widget is mid-stream or has no `sendMessage` exposed.
   */
  canHandoff: boolean;
};

export type ChatPageSuggestionsConnectorParams = {
  /**
   * The ID of the agent configured in the Algolia dashboard. Required unless
   * a custom `transport` is provided.
   */
  agentId?: string;
  /**
   * Maximum number of prompt pills to render.
   * @default 4
   */
  maxSuggestions?: number;
  /**
   * Debounce delay (in ms) before refetching on search-state changes.
   * @default 300
   */
  debounceMs?: number;
  /**
   * Number of hits sampled and sent to the agent as context.
   * @default 5
   */
  hitsToSample?: number;
  /**
   * Additional page-level context to send alongside the search state. Either
   * an object or a function returning one (called per fetch).
   */
  context?: Record<string, unknown> | (() => Record<string, unknown>);
  /**
   * Transform the parsed list before exposing it.
   */
  transformItems?: TransformItems<string>;
  /**
   * Custom transport configuration for the API requests.
   */
  transport?: ChatPageSuggestionsTransport;
  /**
   * Maximum time (in ms) the SSR pipeline waits for the agent response
   * before aborting and resolving so the page can be flushed.
   * @default 150
   */
  ssrTimeoutMs?: number;
  /**
   * Render-state key of the main chat widget to hand off to.
   * @default 'chat'
   */
  chatType?: string;
  /**
   * Identifier of this connector type. Used as the render-state key.
   * @default 'chatPageSuggestions'
   */
  type?: string;
  /**
   * Stable id for SSR snapshot hydration. When omitted, defaults to
   * `instantsearch-${type}`. Must match between server and client renders.
   */
  id?: string;
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

type InstantSearchWithChatStates = InstantSearch & {
  _initialChatStates: Record<string, unknown> | null;
};

type ChatPageSuggestionsSnapshot = {
  suggestions: string[];
};

// Per-InstantSearch, per-widget-id cache of the in-flight SSR wait promise.
// Two-pass SSR (e.g. React renders the tree twice) shares the same Chat
// pattern from chat-page-summary; reuse the in-flight fetch across passes
// rather than refiring.
const serverWaitRegistry = new WeakMap<
  InstantSearch,
  Map<string, Promise<void>>
>();

function isServerRendering(): boolean {
  return safelyRunOnBrowser(() => false, { fallback: () => true });
}

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
        maxSuggestions = 4,
        debounceMs = 300,
        hitsToSample = 5,
        context,
        transformItems = ((items) => items) as NonNullable<
          ChatPageSuggestionsConnectorParams['transformItems']
        >,
        transport,
        ssrTimeoutMs = 150,
        chatType = 'chat',
        type = 'chatPageSuggestions',
        id: idParam,
      } = widgetParams;

      if (!agentId && !transport) {
        throw new Error(
          withUsage(
            'The `agentId` option is required unless a custom `transport` is provided.'
          )
        );
      }

      const id = idParam ?? `instantsearch-${type}`;

      let endpoint: string;
      let headers: Record<string, string>;
      let suggestions: string[] = [];
      let isLoading = false;
      let debounceTimer: ReturnType<typeof setTimeout> | undefined;
      let lastStateSignature: string | null = null;
      let searchHelper: InitOptions['helper'] | null = null;
      let latestRenderOptions: RenderOptions | null = null;
      // Skips the first post-hydration fetch when SSR seeded `suggestions`.
      // Set when `_initialChatStates` is consumed; cleared on the first
      // `render()` that observes results.
      let hydratedFromSnapshot = false;
      let hydrationAttempted = false;

      const hydrateFromSnapshot = (
        instantSearchInstance: InstantSearch
      ): void => {
        if (hydrationAttempted) return;
        hydrationAttempted = true;
        const ssrSnapshots = (
          instantSearchInstance as InstantSearchWithChatStates
        )._initialChatStates;
        const snapshot =
          ssrSnapshots && ssrSnapshots[id]
            ? (ssrSnapshots[id] as ChatPageSuggestionsSnapshot)
            : undefined;
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

      const getOnSuggestionClick =
        (instantSearchInstance: InstantSearch, indexId: string) =>
        (prompt: string) => {
          const chatRenderState = instantSearchInstance.renderState?.[indexId]
            ? (instantSearchInstance.renderState[indexId][
                chatType as 'chat'
              ] as Partial<ChatRenderState> | undefined)
            : undefined;
          if (!chatRenderState) {
            if (__DEV__) {
              warning(
                false,
                `No chat widget found in render state for type "${chatType}". Make sure a \`connectChat\` widget with matching \`type\` is mounted on the same index.`
              );
            }
            return;
          }
          openChat(chatRenderState, {
            message: prompt,
            referer: 'page-suggestions',
          });
        };

      const doFetch = (
        results: SearchResults,
        signal?: AbortSignal
      ): Promise<string[]> => {
        const resolvedContext =
          typeof context === 'function' ? context() : context;
        const finalPayload = buildPayload(
          {
            query: results.query || '',
            hitsSample: results.hits.slice(0, hitsToSample),
            context: resolvedContext,
          },
          {
            maxSuggestions,
            prepareSendMessagesRequest: transport?.prepareSendMessagesRequest,
          }
        );
        return fetch(endpoint, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload),
          signal,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
          })
          .then((data) => parseSuggestions(data, maxSuggestions));
      };

      const getWidgetRenderState = (
        renderOptions: InitOptions | RenderOptions
      ) => {
        const { instantSearchInstance, parent } = renderOptions;

        // React's `useConnector` calls this before `init()` runs (via its
        // `useState` initializer). Hydrate the SSR snapshot here so the
        // first React render already shows the seeded suggestions.
        hydrateFromSnapshot(instantSearchInstance);

        const results =
          'results' in renderOptions ? renderOptions.results : undefined;
        const transformed = transformItems(suggestions, { results });

        const indexId = parent ? parent.getIndexId() : '';

        const chatRenderState =
          indexId && instantSearchInstance.renderState?.[indexId]
            ? (instantSearchInstance.renderState[indexId][
                chatType as 'chat'
              ] as Partial<ChatRenderState> | undefined)
            : undefined;

        // Optimistic when the main chat widget hasn't been observed yet —
        // by click time it should be mounted and click reads fresh state.
        const canHandoff = chatRenderState
          ? Boolean(chatRenderState.sendMessage) && !isChatBusy(chatRenderState)
          : true;

        return {
          suggestions: transformed,
          isLoading,
          onSuggestionClick: getOnSuggestionClick(
            instantSearchInstance,
            indexId
          ),
          canHandoff,
          widgetParams,
        };
      };

      const fetchAndRender = (
        results: SearchResults,
        renderOptions: RenderOptions
      ) => {
        if (!results?.hits?.length) {
          suggestions = [];
          isLoading = false;
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
            renderFn(
              {
                ...getWidgetRenderState(renderOptions),
                instantSearchInstance: renderOptions.instantSearchInstance,
              },
              false
            );
          });
      };

      const buildServerWait = (
        instantSearchInstance: InstantSearch
      ): Promise<void> => {
        return new Promise<void>((resolve) => {
          const abortCtrl =
            typeof AbortController !== 'undefined'
              ? new AbortController()
              : undefined;

          let settled = false;
          const settle = () => {
            if (settled) return;
            settled = true;
            resolve();
          };

          const timer = setTimeout(() => {
            abortCtrl?.abort();
            settle();
          }, ssrTimeoutMs);

          // The helper passed to `init` is the per-index state helper, which
          // has no `derivedHelpers` — only the main helper does. The first
          // derived helper is the one that actually emits `result` events.
          const derivedHelper =
            instantSearchInstance.mainHelper?.derivedHelpers?.[0];
          if (!derivedHelper) {
            clearTimeout(timer);
            settle();
            return;
          }

          // Wait for the first result event from the derived helper, then
          // fire the fetch. The promise resolves on either the fetch
          // settling or the SSR timeout firing — whichever comes first.
          const onResult = (event: { results?: SearchResults }) => {
            derivedHelper.removeListener('result', onResult);
            const results = event?.results;
            if (!results || !results.hits?.length) {
              clearTimeout(timer);
              settle();
              return;
            }
            doFetch(results, abortCtrl?.signal)
              .then((next) => {
                if (settled) return;
                suggestions = next;
                const target =
                  instantSearchInstance as InstantSearchWithChatStates;
                if (!target._initialChatStates) {
                  target._initialChatStates = {};
                }
                target._initialChatStates[id] = {
                  suggestions: next,
                } satisfies ChatPageSuggestionsSnapshot;
              })
              .catch(() => {
                // Swallow — client will refetch on hydration if needed.
              })
              .finally(() => {
                clearTimeout(timer);
                settle();
              });
          };
          derivedHelper.on('result', onResult);
        });
      };

      return {
        $$type: 'ais.chatPageSuggestions',

        init(initOptions) {
          const { instantSearchInstance, helper } = initOptions;
          searchHelper = helper;

          if (transport) {
            endpoint = transport.api;
            headers = transport.headers || {};
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

            endpoint = buildEndpoint({ appId, agentId: agentId as string });
            headers = {
              'x-algolia-application-id': appId,
              'x-algolia-api-key': apiKey,
              'x-algolia-agent': getAlgoliaAgent(instantSearchInstance.client),
            };
          }

          // Client-side: hydrate from SSR snapshot if present so first paint
          // matches server HTML and we don't refire the request. Idempotent
          // — `getWidgetRenderState()` may have already done this for React's
          // pre-init `useState` initializer.
          hydrateFromSnapshot(instantSearchInstance);

          if (isServerRendering()) {
            let perSearch = serverWaitRegistry.get(instantSearchInstance);
            if (!perSearch) {
              perSearch = new Map<string, Promise<void>>();
              serverWaitRegistry.set(instantSearchInstance, perSearch);
            }
            let wait = perSearch.get(id);
            if (!wait) {
              wait = buildServerWait(instantSearchInstance);
              perSearch.set(id, wait);
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

          // First render after hydration: seed signature without fetching.
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
            }, debounceMs);
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
            [type as 'chatPageSuggestions']:
              this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState(renderOptions) {
          return getWidgetRenderState(renderOptions);
        },
      };
    };
  };

export default connectChatPageSuggestions;
