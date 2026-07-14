import { isChatBusy as isChatStreaming, openChat } from '../../lib/chat';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getRefinements,
  noop,
  safelyRunOnBrowser,
  warning,
} from '../../lib/utils';
import connectStructuredOutput from '../structured-output/connectStructuredOutput';

import type { TaskTransport } from '../../lib/tasks';
import type {
  Connector,
  DisposeOptions,
  Hit,
  IndexRenderState,
  InitOptions,
  InstantSearch,
  RenderOptions,
  WidgetRenderState,
} from '../../types';
import type { ChatRenderState } from '../chat/connectChat';
import type {
  StructuredOutputConnectorParams,
  StructuredOutputRenderState,
} from '../structured-output/connectStructuredOutput';
import type { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'on-page-suggestions',
  connector: true,
});

const RENDER_STATE_KEY = 'onPageSuggestions' as const;
const CHAT_RENDER_STATE_KEY = 'chat' as const;
const DEBOUNCE_MS = 300;
const DEFAULT_SSR_TIMEOUT_MS = 150;

function parseSuggestions(data: unknown): string[] {
  const suggestions = (data as { suggestions?: unknown[] } | null | undefined)
    ?.suggestions;

  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions.filter(
    (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0
  );
}

function buildSuggestionMessage(suggestion: string): string {
  return `The user clicked this on-page suggestion. Use the current page context first, then search only if needed.\n\nSuggestion: ${suggestion}`;
}

type InstantSearchWithChatStates = InstantSearch & {
  _initialChatStates: Record<string, unknown> | null;
};

type OnPageSuggestionsSnapshot = {
  suggestions: string[];
};

function isServerRendering(): boolean {
  return safelyRunOnBrowser(() => false, { fallback: () => true });
}

// Per-InstantSearch SSR wait cache: two-pass SSR (e.g. React) renders twice on
// the server, so reuse the in-flight fetch across passes instead of firing twice.
const serverWaitRegistry = new WeakMap<InstantSearch, Promise<void>>();

/** Custom transport for the task request. Alias of the generic `TaskTransport`, kept for API stability. */
export type OnPageSuggestionsTransport = TaskTransport;

/** Metadata passed to `transformItems`. */
export type OnPageSuggestionsTransformItemsMetadata = {
  query: string;
  results: SearchResults | null;
};

/** Custom `transformItems` signature for `connectOnPageSuggestions`. */
export type OnPageSuggestionsTransformItems = (
  items: string[],
  metadata: OnPageSuggestionsTransformItemsMetadata
) => string[];

/** Receives every hit and returns the subset (or reshaped objects) forwarded to the agent as context. */
export type OnPageSuggestionsTransformHits = (hits: Hit[]) => unknown[];

export type OnPageSuggestionsRenderState = {
  /** Backend-generated prompt strings rendered as clickable pills. */
  suggestions: string[];
  /** Whether suggestions are currently being fetched. */
  isLoading: boolean;
  /** Default click handler, calling `sendToChat(prompt)`. Override via the `onSuggestionClick` prop. */
  onSuggestionClick: (prompt: string) => void;
  /** Hands the prompt to the `connectChat` widget on the same index. `true` if dispatched, else `false`. */
  sendToChat: (prompt: string) => boolean;
  /** Imperative refetch that bypasses the debounce. No-op with no results or a fetch in-flight. */
  refresh: () => void;
  /**
   * Whether the chat widget is currently busy (mid-stream) — surface as `disabled` on the pills.
   * Optimistically `false` before the chat mounts and when no chat is present.
   */
  isChatBusy: boolean;
};

/** Either `agentId` or a custom `transport` is required. */
export type OnPageSuggestionsSource =
  | {
      /** ID of the agent configured in the Algolia dashboard. */
      agentId: string;
      transport?: never;
    }
  | {
      /** Custom transport. When set, `agentId` and client credentials are ignored. */
      transport: OnPageSuggestionsTransport;
      agentId?: never;
    };

export type OnPageSuggestionsConnectorParams = OnPageSuggestionsSource & {
  /**
   * Agent Studio configuration to invoke, sent as the `task` field.
   * @default 'on_page_suggestions'
   */
  configurationId?: string;
  /** Transforms hits before use as context (default: first 5, metadata stripped). Ignored with `context`. */
  transformHits?: OnPageSuggestionsTransformHits;
  /** Explicit context, replacing the auto-extracted `{ query, filters, hitsSample }`. Object or per-fetch function. */
  context?: Record<string, unknown> | (() => Record<string, unknown>);
  /** Transforms the parsed suggestions before exposing them. Receives `{ query, results }`. */
  transformItems?: OnPageSuggestionsTransformItems;
  /**
   * Max ms SSR waits for the agent before flushing; on timeout the client refetches after hydration.
   * @default 150
   */
  ssrTimeout?: number;
};

export type OnPageSuggestionsWidgetDescription = {
  $$type: 'ais.onPageSuggestions';
  renderState: OnPageSuggestionsRenderState;
  indexRenderState: {
    onPageSuggestions: WidgetRenderState<
      OnPageSuggestionsRenderState,
      OnPageSuggestionsConnectorParams
    >;
  };
};

export type OnPageSuggestionsConnector = Connector<
  OnPageSuggestionsWidgetDescription,
  OnPageSuggestionsConnectorParams
>;

const INTERNAL_HIT_KEYS = [
  '_highlightResult',
  '_snippetResult',
  '_rankingInfo',
  '_distinctSeqID',
  '__position',
  '__queryID',
] as const;

function stripInternalHitMetadata(hit: Hit): Record<string, unknown> {
  const clean: Record<string, unknown> = { ...hit };
  INTERNAL_HIT_KEYS.forEach((key) => {
    delete clean[key];
  });
  return clean;
}

const DEFAULT_TRANSFORM_HITS: OnPageSuggestionsTransformHits = (hits) =>
  hits.slice(0, 5).map(stripInternalHitMetadata);

function buildFilters(results: SearchResults): string[][] | undefined {
  const state = results._state;
  if (!state) {
    return undefined;
  }

  const groups: string[][] = [];
  const disjunctiveGroups: Record<string, string[]> = {};

  getRefinements(results, state).forEach((refinement) => {
    if (refinement.type === 'numeric') {
      groups.push([
        `${refinement.attribute}${refinement.operator}${refinement.numericValue}`,
      ]);
      return;
    }

    const value =
      refinement.type === 'exclude'
        ? `${refinement.attribute}:-${refinement.name}`
        : `${refinement.attribute}:${refinement.name}`;

    if (refinement.type === 'disjunctive') {
      const group = disjunctiveGroups[refinement.attribute];
      if (group) {
        group.push(value);
      } else {
        const newGroup = [value];
        disjunctiveGroups[refinement.attribute] = newGroup;
        groups.push(newGroup);
      }
      return;
    }

    groups.push([value]);
  });

  return groups.length > 0 ? groups : undefined;
}

const connectOnPageSuggestions: OnPageSuggestionsConnector =
  function connectOnPageSuggestions(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      warning(
        false,
        'OnPageSuggestions is not yet stable and will change in the future.'
      );

      const {
        agentId,
        configurationId,
        transformHits = DEFAULT_TRANSFORM_HITS,
        context,
        transformItems = (items) => items,
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

      let soState: StructuredOutputRenderState | undefined;
      let suggestions: string[] = [];
      let isLoading = false;
      let debounceTimer: ReturnType<typeof setTimeout> | undefined;
      let lastStateSignature: string | null = null;
      let latestRenderOptions: RenderOptions | null = null;
      // Set when SSR seeded suggestions; first post-hydration `render()` skips
      // its fetch (it just seeds the state signature) so the client doesn't
      // immediately overwrite the server snapshot.
      let hydratedFromSnapshot = false;
      let hydrationAttempted = false;
      // Set in `dispose()`. A debounced or in-flight `fetch()` can resolve after
      // the widget is unmounted; this guard stops those late callbacks from
      // calling `renderFn` into a torn-down container.
      let disposed = false;

      const hydrateFromSnapshot = (
        instantSearchInstance: InstantSearch
      ): void => {
        if (hydrationAttempted) return;
        hydrationAttempted = true;
        const states = (instantSearchInstance as InstantSearchWithChatStates)
          ._initialChatStates;
        const snapshot = states?.[RENDER_STATE_KEY] as
          | OnPageSuggestionsSnapshot
          | undefined;
        if (snapshot && Array.isArray(snapshot.suggestions)) {
          suggestions = snapshot.suggestions;
          hydratedFromSnapshot = true;
        }
      };

      const getStateSignature = (results: SearchResults): string => {
        const query = results.query || '';
        const state = results._state;
        const refinements = state
          ? JSON.stringify(state.facetsRefinements) +
            JSON.stringify(state.disjunctiveFacetsRefinements) +
            JSON.stringify(state.hierarchicalFacetsRefinements) +
            JSON.stringify(state.numericRefinements) +
            JSON.stringify(state.tagRefinements)
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
          const results =
            latestRenderOptions?.results ??
            ('results' in renderOptions ? renderOptions.results : null) ??
            null;
          openChat(chatRenderState, {
            message: buildSuggestionMessage(prompt),
            referer: 'on-page-suggestions',
            turnContext: buildTurnContext(results),
          });
          return true;
        };

      const resolvePageContext = (
        results: SearchResults | null
      ): Record<string, unknown> | undefined => {
        const resolvedContext =
          typeof context === 'function' ? context() : context;
        // Explicit context replaces auto-extraction; otherwise derive it from
        // the current search state. The task's server-owned instructions decide
        // how to interpret the shape — the client doesn't label it.
        if (resolvedContext) {
          return { ...resolvedContext };
        }
        if (!results) {
          return undefined;
        }
        const filters = buildFilters(results);
        return {
          query: results.query || '',
          ...(filters ? { filters } : {}),
          hitsSample: transformHits(results.hits as Hit[]),
        };
      };

      const buildInput = (results: SearchResults): Record<string, unknown> =>
        resolvePageContext(results) ?? {};

      // The same page context, flattened for the chat handoff: `turnContext` is
      // a flat `Record<string, string>` per the Agent Studio contract, so
      // non-string values (e.g. `hitsSample`) are serialized.
      const buildTurnContext = (
        results: SearchResults | null
      ): Record<string, string> | undefined => {
        const pageContext = resolvePageContext(results);
        if (!pageContext) {
          return undefined;
        }
        return Object.fromEntries(
          Object.entries(pageContext).map(([key, value]) => [
            key,
            typeof value === 'string' ? value : JSON.stringify(value),
          ])
        );
      };

      const renderOutward = (renderOptions: InitOptions | RenderOptions) => {
        if (disposed) return;
        renderFn(
          {
            ...getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      };

      const fetchAndRender = (
        results: SearchResults,
        renderOptions: RenderOptions
      ) => {
        if (disposed || !soState) return;
        const hasContext = context !== undefined;
        if (!hasContext && !results?.hits?.length) {
          suggestions = [];
          isLoading = false;
          renderOutward(renderOptions);
          return;
        }

        soState.submit(buildInput(results));
      };

      const refresh = () => {
        if (isLoading) return;
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

          const derivedHelper =
            instantSearchInstance.mainHelper?.derivedHelpers?.[0];
          if (!derivedHelper) {
            clearTimeout(timer);
            settle();
            return;
          }

          const onResult = (event: { results?: SearchResults }) => {
            derivedHelper.removeListener('result', onResult);
            // The SSR timeout may have already resolved this wait; a late
            // `result` event must not fire another agent request.
            if (settled || !soState) return;
            const results = event?.results;
            const hasContext = context !== undefined;
            if (!results || (!hasContext && !results.hits?.length)) {
              clearTimeout(timer);
              settle();
              return;
            }
            soState
              .submit(buildInput(results))
              .then((output) => {
                // Skip seeding on error so the client refetches on hydration
                // instead of hydrating an empty snapshot that suppresses it.
                if (settled || soState?.error) return;
                const target =
                  instantSearchInstance as InstantSearchWithChatStates;
                if (!target._initialChatStates) {
                  target._initialChatStates = {};
                }
                target._initialChatStates[RENDER_STATE_KEY] = {
                  suggestions: parseSuggestions(output),
                } satisfies OnPageSuggestionsSnapshot;
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
      ): Omit<OnPageSuggestionsRenderState, never> & {
        widgetParams: OnPageSuggestionsConnectorParams;
      } => {
        hydrateFromSnapshot(renderOptions.instantSearchInstance);

        const results =
          'results' in renderOptions ? renderOptions.results : undefined;
        const transformed = transformItems(suggestions, {
          query: results?.query || '',
          results: results || null,
        });

        const chatRenderState = getChatRenderState(renderOptions);

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

      // Mirrors each inner render (submit start → skeleton, stream partials,
      // resolve/error) into this widget's state and re-renders on the client.
      // SSR seeds via the awaited `submit` in `buildServerWait`, so outward
      // renders are skipped there.
      const handleInnerRender = (renderState: StructuredOutputRenderState) => {
        soState = renderState;
        // Preserve SSR-hydrated pills until the first generation begins: only
        // adopt the inner output once a request is loading or has produced one.
        if (renderState.isLoading || renderState.output !== undefined) {
          suggestions = parseSuggestions(renderState.output);
        }
        isLoading = renderState.isLoading;
        if (isServerRendering() || !latestRenderOptions) return;
        renderOutward(latestRenderOptions);
      };

      const structuredOutputWidget = connectStructuredOutput(
        handleInnerRender,
        noop
      )({
        ...(transport ? { transport } : { agentId }),
        task: configurationId ?? 'on_page_suggestions',
        stream: true,
      } as StructuredOutputConnectorParams);

      return {
        $$type: 'ais.onPageSuggestions',

        init(initOptions) {
          const { instantSearchInstance } = initOptions;

          structuredOutputWidget.init!(initOptions);

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

        dispose(disposeOptions: DisposeOptions) {
          disposed = true;
          clearTimeout(debounceTimer);
          structuredOutputWidget.dispose!(disposeOptions);
          unmountFn();
        },

        getRenderState(
          renderState,
          renderOptions
        ): IndexRenderState &
          OnPageSuggestionsWidgetDescription['indexRenderState'] {
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

export default connectOnPageSuggestions;
