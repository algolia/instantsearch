import {
  buildFilters,
  DisplayResultsToolType,
  isChatBusy,
  MemorizeToolType,
  MemorySearchToolType,
  openChat,
  PonderToolType,
  RecommendToolType,
  SearchIndexToolType,
  stripInternalHitMetadata,
} from '../../lib/chat';
import {
  addAbsolutePosition,
  addQueryID,
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  noop,
  safelyRunOnBrowser,
  warning,
} from '../../lib/utils';
import connectChat from '../chat/connectChat';

import type { DefaultChatTransport } from '../../lib/ai-lite';
import type { ChatReferer, UIMessage } from '../../lib/chat';
import type { SendEventForHits } from '../../lib/utils';
import type {
  Connector,
  DisposeOptions,
  Hit,
  IndexRenderState,
  IndexUiState,
  IndexWidget,
  InitOptions,
  RenderOptions,
  WidgetRenderState,
} from '../../types';
import type {
  ChatAgentRequestOptions,
  ChatConnectorParams,
  ChatRenderState,
} from '../chat/connectChat';
import type { SearchResults } from 'algoliasearch-helper';
import type { ClientSideTools } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'result-card',
  connector: true,
});

/** `x-algolia-referer` sent with the card's completion requests. */
export const RESULT_CARD_REFERER: ChatReferer = 'result-card';
/** `metadata.source` set on the messages handed off to the chat. */
export const RESULT_CARD_SOURCE = 'resultCard';
const RULE_CONTEXT_PREFIX = 'agent-studio-result-card-';
const CHAT_RENDER_STATE_KEY = 'chat' as const;
const MAX_RULE_CONTEXTS = 10;
const DEBOUNCE_MS = 700;
const HITS_SAMPLE_SIZE = 5;
const MIN_QUERY_WORDS = 2;

/**
 * The Rule context that ties the Rules Agent Studio manages for this agent to
 * the search. The Dashboard derives the same value, so the two must agree.
 */
export function getResultCardRuleContext(agentId: string): string {
  return `${RULE_CONTEXT_PREFIX}${agentId}`.replace(/[^A-Za-z0-9_-]/g, '_');
}

export type ResultCardStatus =
  /** No Rule matched the current search (or the query is too short). */
  | 'hidden'
  /** Activated, no answer text yet: debouncing, requesting, or awaiting the first token. */
  | 'loading'
  | 'streaming'
  | 'complete'
  | 'failed'
  /** Dismissed by the user for the current query and filters. */
  | 'dismissed';

export type ResultCardRenderState<TUiMessage extends UIMessage = UIMessage> = {
  status: ResultCardStatus;
  /** The query the answer is about. */
  query: string;
  /**
   * The card's conversation: the user turn holding the query, then the
   * assistant answer as it streams.
   */
  messages: TUiMessage[];
  /** The error of the latest failed generation. */
  error: Error | undefined;
  /** Follow-up suggestions sent by the agent with the answer. */
  suggestions?: string[];
  /** Sends the request again. Always a new request, never a resume. */
  retry: () => void;
  /**
   * Hides the card until the query, filters, or top hits change. Cancels a
   * generation in progress.
   */
  dismiss: () => void;
  /**
   * Whether a `chat` widget using the same `agentId` is mounted on this index,
   * i.e. whether `continueInChat` has somewhere to go.
   */
  canContinueInChat: boolean;
  /**
   * Hands the conversation to the `chat` widget on this index and opens it.
   * When `message` is given (e.g. a follow-up suggestion), it is sent as the
   * next turn.
   */
  continueInChat: (message?: string) => void;
  /** Whether a long answer shows in full rather than clipped with a scroll. */
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  /** Tools the shared chat message renderer needs to render tool parts. */
  tools: ClientSideTools;
  indexUiState: IndexUiState;
  setIndexUiState: IndexWidget['setIndexUiState'];
  /** Sends an event to the Insights middleware. */
  sendEvent: SendEventForHits;
};

type ChatTransportOptions = ConstructorParameters<
  typeof DefaultChatTransport
>[0];

/** Either a custom `transport` or `requestOptions` for the built-in one. */
export type ResultCardTransport =
  | {
      /** Custom endpoint, with the same shape as the `chat` widget's `transport`. */
      transport: ChatTransportOptions;
      requestOptions?: never;
    }
  | {
      transport?: never;
      /** Headers or query parameters for the built-in Agent Studio transport. */
      requestOptions?: ChatAgentRequestOptions;
    };

export type ResultCardConnectorParams = ResultCardTransport & {
  /**
   * ID of the agent configured in the Algolia dashboard. Required even with a
   * custom `transport`: the Rule context sent with each search derives from it.
   */
  agentId: string;
};

export type ResultCardWidgetDescription = {
  $$type: 'ais.resultCard';
  renderState: ResultCardRenderState;
  indexRenderState: {
    resultCard: WidgetRenderState<
      ResultCardRenderState,
      ResultCardConnectorParams
    >;
  };
};

export type ResultCardConnector = Connector<
  ResultCardWidgetDescription,
  ResultCardConnectorParams
>;

type RequestContext = {
  query: string;
  filters: string[][] | undefined;
  hits: Hit[];
};

type Activation = {
  /** Same query, index, and filters; hits sample may still differ. */
  base: string;
  signature: string;
  context: RequestContext;
};

function countWords(query: string): number {
  return query.trim().split(/\s+/).filter(Boolean).length;
}

function isActivated(results: SearchResults): boolean {
  return (
    results.renderingContent?.widgets?.resultCard?.enabled === true &&
    countWords(results.query || '') >= MIN_QUERY_WORDS
  );
}

function computeActivation(
  results: SearchResults,
  previous: Activation | null
): Activation {
  const query = results.query || '';
  const filters = buildFilters(results);
  const base = `${results.index}|${query}|${JSON.stringify(filters ?? [])}`;

  // Pagination and "load more" change the hits but not the question, so the
  // sample settled on the first page is kept and the card stays in place.
  if (previous && previous.base === base && results.page > 0) {
    return previous;
  }

  const hits = (results.hits as Hit[]).slice(0, HITS_SAMPLE_SIZE);
  const hitIds = JSON.stringify(hits.map((hit) => hit.objectID));

  return {
    base,
    signature: `${base}|${hitIds}`,
    context: { query, filters, hits },
  };
}

function buildTurnContext({
  query,
  filters,
  hits,
}: RequestContext): Record<string, string> {
  // `metadata.turnContext` is a flat string map, so non-string values are
  // serialized; same keys and shapes as the `promptSuggestions` widget.
  return {
    query,
    ...(filters ? { filters: JSON.stringify(filters) } : {}),
    hitsSample: JSON.stringify(hits.map(stripInternalHitMetadata)),
  };
}

// Sent as-is, the query reads as a search: the agent re-runs it and answers
// "I found…", which the hits below already show. Each clause of the question
// heads off a failure mode: "prefer the results provided" answers from
// `hitsSample`; "search for better ones" covers a natural-language query that
// matched the wrong records; "never display results" stops an agent with that
// tool from replying with a `display_results` call and no text, which the
// card cannot show. Stopgap until the backend applies a result-card
// instruction from the `x-algolia-referer` header.
function buildQuestion(query: string): string {
  return `I'm looking for "${query}". Which of these results would you recommend and why? Prefer the results provided; if they don't answer the question, search for better ones. Always answer in two or three sentences and never display results.`;
}

function hasAssistantMessage(messages: UIMessage[] | undefined): boolean {
  return Boolean(messages?.some((message) => message.role === 'assistant'));
}

const connectResultCard: ResultCardConnector = function connectResultCard(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const { agentId, transport, requestOptions } = widgetParams || {};

    if (!agentId) {
      throw new Error(withUsage('The `agentId` option is required.'));
    }
    if (transport && requestOptions) {
      throw new Error(
        withUsage(
          'The `transport` and `requestOptions` options are mutually exclusive.'
        )
      );
    }

    const ruleContext = getResultCardRuleContext(agentId);

    let chatState: ChatRenderState | undefined;
    let latestRenderOptions: InitOptions | RenderOptions | null = null;
    let activation: Activation | null = null;
    let dismissed = false;
    let expanded = false;
    // True between a signature change and the debounced request that follows
    // it, so the card shows its skeleton rather than the previous answer.
    let requestPending = false;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    // Set in `dispose()`: a stream can still deliver chunks into the inner
    // chat afterwards, and those renders must not reach a torn-down container.
    let disposed = false;
    let sendEvent: SendEventForHits;

    const chatParams = {
      agentId,
      ...(transport ? { transport } : { requestOptions }),
      // The card owns its conversation: nothing shared with the chat panel.
      persistence: false,
      type: 'resultCard',
      disableTriggerValidation: true,
      // The agent runs its built-in tools server-side and streams their
      // output. Registering them without `onToolCall` keeps that output; an
      // unknown tool is answered with "No tool implemented", which drops the
      // hits the chat's display-results needs after the handoff.
      tools: {
        [SearchIndexToolType]: {},
        [RecommendToolType]: {},
        [DisplayResultsToolType]: {},
        [MemorizeToolType]: {},
        [MemorySearchToolType]: {},
        [PonderToolType]: {},
      },
    } as ChatConnectorParams;

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

    const rerender = () => {
      if (latestRenderOptions) {
        renderOutward(latestRenderOptions);
      }
    };

    // Mirrors every inner render (message deltas, status, errors) into this
    // widget's own render. The inner widget's `init` render lands before
    // `latestRenderOptions` is set, so it is stored but not painted.
    const handleInnerRender = (renderState: ChatRenderState) => {
      chatState = renderState;
      rerender();
    };

    const chatWidget = connectChat(handleInnerRender, noop)(chatParams);

    const stopGeneration = () => {
      if (chatState && isChatBusy(chatState)) {
        chatState.stop();
      }
    };

    const cancelPendingRequest = () => {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
      requestPending = false;
    };

    const send = () => {
      cancelPendingRequest();
      if (disposed || !chatState || !activation) return;

      const { context } = activation;
      // A fresh conversation per question: new id, no previous turns, no error.
      chatState.clearMessages();
      chatState.sendMessage(
        {
          text: buildQuestion(context.query),
          metadata: { turnContext: buildTurnContext(context) },
        },
        { headers: { 'x-algolia-referer': RESULT_CARD_REFERER } }
      );

      if (
        sendEvent &&
        latestRenderOptions &&
        'results' in latestRenderOptions
      ) {
        const results = latestRenderOptions.results;
        if (results) {
          sendEvent(
            'view:internal',
            addQueryID(
              addAbsolutePosition(
                context.hits,
                results.page,
                results.hitsPerPage
              ),
              results.queryID
            )
          );
        }
      }
    };

    const scheduleRequest = () => {
      cancelPendingRequest();
      requestPending = true;
      // Generation is a browser concern: a server render shows the skeleton
      // and the browser starts the request after hydration.
      safelyRunOnBrowser(() => {
        debounceTimer = setTimeout(send, DEBOUNCE_MS);
      });
    };

    // In each transition below the card's own state is settled before
    // `stopGeneration()`: stopping re-renders synchronously through the inner
    // chat, and that render must already see the new status.
    const deactivate = () => {
      cancelPendingRequest();
      activation = null;
      dismissed = false;
      stopGeneration();
    };

    const syncActivation = (results: SearchResults) => {
      if (!isActivated(results)) {
        if (activation) deactivate();
        return;
      }

      const next = computeActivation(results, activation);
      if (activation && next.signature === activation.signature) {
        return;
      }

      // A new question: the previous answer, error, and dismissal go with it.
      activation = next;
      dismissed = false;
      expanded = false;
      scheduleRequest();
      stopGeneration();
    };

    const retry = () => {
      if (!activation || dismissed) return;
      send();
    };

    const dismiss = () => {
      if (!activation || dismissed) return;
      cancelPendingRequest();
      dismissed = true;
      stopGeneration();
      rerender();
    };

    const setExpanded = (nextExpanded: boolean) => {
      if (expanded === nextExpanded) return;
      expanded = nextExpanded;
      rerender();
    };

    const getDefaultChat = (
      renderOptions: InitOptions | RenderOptions | null
    ): Partial<ChatRenderState> | undefined => {
      if (!renderOptions) return undefined;
      const { instantSearchInstance, parent } = renderOptions;
      const indexId = parent ? parent.getIndexId() : '';
      const defaultChat = instantSearchInstance.renderState?.[indexId]?.[
        CHAT_RENDER_STATE_KEY
      ] as
        | Partial<WidgetRenderState<ChatRenderState, ChatConnectorParams>>
        | undefined;
      // Only the agent is compared: a custom `transport` on either side does
      // not affect the handoff.
      if (
        !defaultChat?.adoptConversation ||
        defaultChat.widgetParams?.agentId !== agentId
      ) {
        return undefined;
      }
      return defaultChat;
    };

    const continueInChat = (message?: string) => {
      const defaultChat = getDefaultChat(latestRenderOptions);
      if (!defaultChat || !chatState) return;

      defaultChat.adoptConversation!({
        id: chatState.id,
        messages: chatState.messages,
        source: RESULT_CARD_SOURCE,
      });
      openChat(defaultChat, { message, referer: RESULT_CARD_REFERER });
    };

    const getStatus = (
      currentActivation: Activation | null
    ): ResultCardStatus => {
      if (!currentActivation) return 'hidden';
      if (dismissed) return 'dismissed';
      if (chatState?.status === 'error') return 'failed';
      if (chatState?.status === 'streaming') return 'streaming';
      if (chatState?.status === 'submitted' || requestPending) return 'loading';
      return hasAssistantMessage(chatState?.messages) ? 'complete' : 'loading';
    };

    const getWidgetRenderState = (
      renderOptions: InitOptions | RenderOptions
    ): ResultCardRenderState & {
      widgetParams: ResultCardConnectorParams;
    } => {
      const { instantSearchInstance, helper, parent } = renderOptions;
      const results =
        'results' in renderOptions ? renderOptions.results : undefined;

      if (!sendEvent) {
        sendEvent = createSendEventForHits({
          instantSearchInstance,
          helper,
          widgetType: 'ais.resultCard',
        });
      }

      // Before `render` has run (server render, or React computing its initial
      // state) the activation is derived from the results at hand, without
      // scheduling anything.
      const currentActivation =
        activation ??
        (results && isActivated(results)
          ? computeActivation(results, null)
          : null);
      const status = getStatus(currentActivation);
      const canContinueInChat = Boolean(getDefaultChat(renderOptions));

      if (status === 'complete') {
        warning(
          canContinueInChat,
          `No \`chat\` widget with the agent "${agentId}" is mounted on this index, so the Result Card cannot hand its conversation off and hides "Continue in chat".`
        );
      }

      return {
        status,
        query: currentActivation?.context.query ?? '',
        messages: chatState?.messages ?? [],
        // The inner chat keeps the last error around after recovering.
        error: status === 'failed' ? chatState?.error : undefined,
        suggestions: chatState?.suggestions,
        retry,
        dismiss,
        canContinueInChat,
        continueInChat,
        expanded,
        setExpanded,
        tools: chatState?.tools ?? {},
        indexUiState: instantSearchInstance.getUiState()[parent.getIndexId()],
        setIndexUiState: parent.setIndexUiState.bind(parent),
        sendEvent,
        widgetParams,
      };
    };

    return {
      $$type: 'ais.resultCard',
      // "Continue in chat" opens the chat, so this widget counts as an entry
      // point for `connectChat`'s trigger validation.
      opensChat: true as const,

      init(initOptions) {
        chatWidget.init(initOptions);
        // After the inner init so its first render is stored, not painted.
        latestRenderOptions = initOptions;

        renderFn(
          {
            ...getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        latestRenderOptions = renderOptions;

        if (renderOptions.results) {
          syncActivation(renderOptions.results);
        }

        renderOutward(renderOptions);
      },

      dispose(disposeOptions: DisposeOptions) {
        disposed = true;
        cancelPendingRequest();
        stopGeneration();
        chatWidget.dispose();
        unmountFn();

        // Only this widget's context leaves with it.
        const remaining = (disposeOptions.state.ruleContexts || []).filter(
          (context) => context !== ruleContext
        );
        return disposeOptions.state.setQueryParameter(
          'ruleContexts',
          remaining.length > 0 ? remaining : undefined
        );
      },

      getWidgetSearchParameters(state) {
        const ruleContexts = state.ruleContexts || [];
        if (ruleContexts.includes(ruleContext)) {
          return state;
        }

        warning(
          ruleContexts.length < MAX_RULE_CONTEXTS,
          `The search already carries ${MAX_RULE_CONTEXTS} \`ruleContexts\`. The Result Card context "${ruleContext}" was appended anyway, but Algolia only applies the first ${MAX_RULE_CONTEXTS}.`
        );

        return state.setQueryParameter('ruleContexts', [
          ...ruleContexts,
          ruleContext,
        ]);
      },

      getRenderState(
        renderState,
        renderOptions
      ): IndexRenderState & ResultCardWidgetDescription['indexRenderState'] {
        return {
          ...renderState,
          resultCard: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState(renderOptions) {
        return getWidgetRenderState(renderOptions);
      },
    };
  };
};

export default connectResultCard;
