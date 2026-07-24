import { isChatBusy as isChatStreaming, openChat } from '../../lib/chat';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getRefinements,
  noop,
  warning,
} from '../../lib/utils';
import connectTasks from '../tasks/connectTasks';

import type { TaskTransport } from '../../lib/tasks';
import type {
  Connector,
  DisposeOptions,
  Hit,
  IndexRenderState,
  InitOptions,
  RenderOptions,
  WidgetRenderState,
} from '../../types';
import type { ChatRenderState } from '../chat/connectChat';
import type {
  TasksConnectorParams,
  TasksRenderState,
} from '../tasks/connectTasks';
import type { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'prompt-suggestions',
  connector: true,
});

const RENDER_STATE_KEY = 'promptSuggestions' as const;
const CHAT_RENDER_STATE_KEY = 'chat' as const;
const DEBOUNCE_MS = 300;

function parseSuggestions(data: unknown): string[] {
  const suggestions = (data as { suggestions?: unknown[] } | null | undefined)
    ?.suggestions;

  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions.filter((s: unknown): s is string => typeof s === 'string');
}

function buildSuggestionMessage(suggestion: string): string {
  return `The user clicked this on-page suggestion. Use the current page context first, then search only if needed.\n\nSuggestion: ${suggestion}`;
}

/** Custom transport for the task request. Alias of the generic `TaskTransport`, kept for API stability. */
export type PromptSuggestionsTransport = TaskTransport;

/** Metadata passed to `transformItems`. */
export type PromptSuggestionsTransformItemsMetadata = {
  query: string;
  results: SearchResults | null;
};

/** Custom `transformItems` signature for `connectPromptSuggestions`. */
export type PromptSuggestionsTransformItems = (
  items: string[],
  metadata: PromptSuggestionsTransformItemsMetadata
) => string[];

/** Receives every hit and returns the subset (or reshaped objects) forwarded to the agent as context. */
export type PromptSuggestionsTransformHits = (hits: Hit[]) => unknown[];

export type PromptSuggestionsRenderState = {
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
export type PromptSuggestionsSource =
  | {
      /** ID of the agent configured in the Algolia dashboard. */
      agentId: string;
      transport?: never;
    }
  | {
      /** Custom transport. When set, `agentId` and client credentials are ignored. */
      transport: PromptSuggestionsTransport;
      agentId?: never;
    };

export type PromptSuggestionsConnectorParams = PromptSuggestionsSource & {
  /**
   * Agent Studio configuration to invoke, sent as the `task` field. Identifies
   * the prompt-suggestions configuration created in the dashboard.
   */
  configurationId: string;
  /** Transforms hits before use as context (default: first 5, metadata stripped). Ignored with `context`. */
  transformHits?: PromptSuggestionsTransformHits;
  /** Explicit context, replacing the auto-extracted `{ query, filters, hitsSample }`. Object or per-fetch function. */
  context?: Record<string, unknown> | (() => Record<string, unknown>);
  /** Transforms the parsed suggestions before exposing them. Receives `{ query, results }`. */
  transformItems?: PromptSuggestionsTransformItems;
};

export type PromptSuggestionsWidgetDescription = {
  $$type: 'ais.promptSuggestions';
  renderState: PromptSuggestionsRenderState;
  indexRenderState: {
    promptSuggestions: WidgetRenderState<
      PromptSuggestionsRenderState,
      PromptSuggestionsConnectorParams
    >;
  };
};

export type PromptSuggestionsConnector = Connector<
  PromptSuggestionsWidgetDescription,
  PromptSuggestionsConnectorParams
>;

function stripInternalHitMetadata(hit: Hit): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  Object.keys(hit).forEach((key) => {
    // Strip internal metadata, which is `_`-prefixed
    // (`_highlightResult`, `_rankingInfo`, `__position`, …).
    if (!key.startsWith('_')) {
      clean[key] = (hit as Record<string, unknown>)[key];
    }
  });
  return clean;
}

const DEFAULT_TRANSFORM_HITS: PromptSuggestionsTransformHits = (hits) =>
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

const connectPromptSuggestions: PromptSuggestionsConnector =
  function connectPromptSuggestions(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      warning(
        false,
        'PromptSuggestions is not yet stable and will change in the future.'
      );

      const {
        agentId,
        configurationId,
        transformHits = DEFAULT_TRANSFORM_HITS,
        context,
        transformItems = (items) => items,
        transport,
      } = widgetParams;

      if (!agentId && !transport) {
        throw new Error(
          withUsage(
            'The `agentId` option is required unless a custom `transport` is provided.'
          )
        );
      }

      if (!configurationId) {
        throw new Error(withUsage('The `configurationId` option is required.'));
      }

      let tasksState: TasksRenderState | undefined;
      let suggestions: string[] = [];
      let isLoading = false;
      let debounceTimer: ReturnType<typeof setTimeout> | undefined;
      let lastStateSignature: string | null = null;
      let latestRenderOptions: RenderOptions | null = null;
      // Set in `dispose()`. A debounced or in-flight `fetch()` can resolve after
      // the widget is unmounted; this guard stops those late callbacks from
      // calling `renderFn` into a torn-down container.
      let disposed = false;
      // True between a state-signature change and the debounced refetch that
      // follows it. While pending, the search state has already moved on, so a
      // still-in-flight request from the previous state must not paint its
      // suggestions, its inner render is ignored until the new `submit` starts.
      let refetchPending = false;

      const getStateSignature = (results: SearchResults): string => {
        if (results.queryID) {
          return results.queryID;
        }
        const query = results.query || '';
        const filters = JSON.stringify(buildFilters(results) ?? []);
        const hitIds = (results.hits || [])
          .map((hit) => hit.objectID)
          .join(',');
        return `${query}|${filters}|${hitIds}`;
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
          return openChat(chatRenderState, {
            message: buildSuggestionMessage(prompt),
            referer: 'prompt-suggestions-widget',
            turnContext: buildTurnContext(results),
          });
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
        const entries = Object.entries(pageContext)
          .map(([key, value]): [string, string] => [
            key,
            typeof value === 'string' ? value : JSON.stringify(value),
          ])
          .filter(([, value]) => value.trim() !== '');
        return entries.length > 0 ? Object.fromEntries(entries) : undefined;
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
        if (disposed || !tasksState) return;
        refetchPending = false;
        const hasContext = context !== undefined;
        if (!hasContext && !results?.hits?.length) {
          tasksState.invalidate();
          suggestions = [];
          isLoading = false;
          renderOutward(renderOptions);
          return;
        }

        tasksState.submit(buildInput(results));
      };

      const refresh = () => {
        if (isLoading) return;
        const results = latestRenderOptions?.results;
        if (!results || !latestRenderOptions) return;
        clearTimeout(debounceTimer);
        lastStateSignature = getStateSignature(results);
        fetchAndRender(results, latestRenderOptions);
      };

      const getWidgetRenderState = (
        renderOptions: InitOptions | RenderOptions
      ): Omit<PromptSuggestionsRenderState, never> & {
        widgetParams: PromptSuggestionsConnectorParams;
      } => {
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
      const handleInnerRender = (renderState: TasksRenderState) => {
        tasksState = renderState;
        if (refetchPending) return;
        if (renderState.error) {
          // A failed task (including a mid-stream `error` event) must not leave
          // any streamed partial visible. There's no error UI for now, so fall
          // back to a blank suggestions state.
          suggestions = [];
        } else if (renderState.isLoading || renderState.output !== undefined) {
          // Only adopt the inner output once a request is loading or has
          // produced one, so the initial no-op render doesn't clobber pills.
          suggestions = parseSuggestions(renderState.output);
        }
        isLoading = renderState.isLoading;
        if (!latestRenderOptions) return;
        renderOutward(latestRenderOptions);
      };

      const tasksWidget = connectTasks(
        handleInnerRender,
        noop
      )({
        ...(transport ? { transport } : { agentId }),
        task: configurationId,
        stream: true,
      } as TasksConnectorParams);

      return {
        $$type: 'ais.promptSuggestions',

        init(initOptions) {
          const { instantSearchInstance } = initOptions;

          tasksWidget.init!(initOptions);

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

          if (stateSignature !== lastStateSignature) {
            lastStateSignature = stateSignature;
            refetchPending = true;
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
          tasksWidget.dispose!(disposeOptions);
          unmountFn();
        },

        getRenderState(
          renderState,
          renderOptions
        ): IndexRenderState &
          PromptSuggestionsWidgetDescription['indexRenderState'] {
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

export default connectPromptSuggestions;
