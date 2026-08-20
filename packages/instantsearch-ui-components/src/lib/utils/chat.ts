import { startsWith } from './startsWith';

import type { ChatRecordsStore } from './chatRecords';
import type { ChatMessageBase } from '../../components';
import type {
  AddToolResult,
  AddToolResultWithOutput,
  ApplyFiltersParams,
  ChatStatus,
  ChatToolMessage,
  ClientSideTool,
  ClientSideToolContext,
  ClientSideTools,
  SearchToolInput,
  SearchToolQuery,
} from '../../components/chat/types';
import type { SendEventForHits } from '../../types';

/**
 * The status-only fallback for "a request is in flight".
 *
 * `context.isBusy` — the chat instance's own answer — is what components should
 * read. This exists so the one place that has to guess from `status` alone,
 * when no widget supplied the turn state, still has a single definition.
 */
export const isStatusBusy = (status: ChatStatus | undefined) =>
  status === 'submitted' || status === 'streaming';

export const getTextContent = (message: ChatMessageBase) => {
  return message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('');
};

export const hasTextContent = (message: ChatMessageBase) => {
  return getTextContent(message).trim() !== '';
};

export const isPartText = (
  part: ChatMessageBase['parts'][number]
): part is Extract<ChatMessageBase['parts'][number], { type: 'text' }> => {
  return part.type === 'text';
};

export const isPartTool = (
  part: ChatMessageBase['parts'][number]
): part is ChatToolMessage => {
  return startsWith(part.type, 'tool-');
};

export function isReasoningPartActive(
  parts: ChatMessageBase['parts'],
  index: number
): boolean {
  const part = parts[index];

  return (
    part?.type === 'reasoning' &&
    part.state === 'streaming' &&
    !parts
      .slice(index + 1)
      .some(
        (laterPart) =>
          laterPart.type !== 'reasoning' || laterPart.state === 'streaming'
      )
  );
}

export const findTool = (
  partType: string,
  tools: ClientSideTools
): ClientSideTool | undefined => {
  const toolName = partType.replace('tool-', '');
  let tool: ClientSideTool | undefined = tools[toolName];
  if (!tool) {
    tool = Object.entries(tools).find(([key]) =>
      startsWith(toolName, `${key}_`)
    )?.[1];
  }
  return tool;
};

/** The tool-scoped half of a tool context, on top of the shared chat context. */
export type ClientSideToolContextExtras<TMessage extends ChatMessageBase> =
  Pick<
    ClientSideToolContext<TMessage>,
    | 'addToolResult'
    | 'applyFilters'
    | 'indexUiState'
    | 'insightsEventContext'
    | 'message'
    | 'parentMessage'
    | 'records'
    | 'sendEvent'
    | 'setIndexUiState'
  >;

/**
 * A tool whose results are submitted through the message that owns the call,
 * rather than through the chat-wide channel. The connector attaches the
 * message-scoped variant; tools registered by hand may not have it.
 */
export type MessageScopedClientSideTool = ClientSideTool & {
  '~addToolResultForMessage'?: (
    message: ChatMessageBase,
    params: Parameters<AddToolResult>[0]
  ) => ReturnType<AddToolResult>;
};

/**
 * Builds the tool-scoped half of a tool context: the fields that depend on
 * which tool call is in play, rather than on the chat as a whole.
 *
 * Spread over a chat context to get a full one. The renderer spreads it over
 * `ChatComponentContext` for `layoutComponent`; the connector spreads it over
 * the same context minus `maximized`/`isClearing`, which it does not own, for
 * `shouldRender`. Sharing this builder is what guarantees the decision and the
 * rendering read identical data.
 */
export function createClientSideToolContextExtras<
  TMessage extends ChatMessageBase,
>({
  tool,
  parentMessage,
  part,
  indexUiState,
  setIndexUiState,
  getFallbackRecords,
}: {
  tool: MessageScopedClientSideTool;
  parentMessage: TMessage;
  part: ChatToolMessage;
  indexUiState: object;
  setIndexUiState: (state: object) => void;
  getFallbackRecords: () => ChatRecordsStore;
}): ClientSideToolContextExtras<TMessage> {
  const addToolResult: AddToolResultWithOutput = (params) => {
    const resultParams = {
      output: params.output,
      tool: part.type,
      toolCallId: part.toolCallId,
    };

    return tool['~addToolResultForMessage']
      ? tool['~addToolResultForMessage'](parentMessage, resultParams)
      : tool.addToolResult(resultParams);
  };

  const toolSendEvent = tool.sendEvent || (() => {});
  const agentId = tool.insightsEventContext?.agentId;
  // Hits rendered by a tool have no `queryID` of their own, so events are
  // attributed to the message that produced them.
  const sendEvent = ((
    eventType: any,
    hits?: any,
    eventName?: any,
    additionalData?: any
  ) => {
    if (
      hits === undefined &&
      eventName === undefined &&
      additionalData === undefined
    ) {
      return toolSendEvent(eventType);
    }

    return toolSendEvent(eventType, hits, eventName, {
      ...(additionalData || {}),
      queryID: 'message_' + parentMessage.id,
      ...(agentId ? { agentId } : {}),
      toolCallId: part.toolCallId,
    });
  }) as SendEventForHits;

  return {
    records: tool.records || getFallbackRecords(),
    message: part,
    parentMessage,
    insightsEventContext: tool.insightsEventContext,
    indexUiState,
    setIndexUiState,
    addToolResult,
    applyFilters: tool.applyFilters,
    sendEvent,
  };
}

const FACET_KEY_PREFIX = 'facet_';

const hasQueries = (
  input: SearchToolInput
): input is { queries: SearchToolQuery[] } => Array.isArray(input.queries);

const getSearchToolQuery = (
  input: SearchToolInput | undefined
): SearchToolQuery | undefined => {
  if (!input) {
    return undefined;
  }

  return hasQueries(input) ? input.queries[0] : input;
};

const getFacetFilters = (
  query: SearchToolQuery | undefined
): string[][] | undefined => {
  if (!query) {
    return undefined;
  }

  if (Array.isArray(query.facet_filters)) {
    return query.facet_filters;
  }

  const facetFilters = Object.entries(query).reduce<string[][]>(
    (acc, [key, value]) => {
      if (!startsWith(key, FACET_KEY_PREFIX) || !Array.isArray(value)) {
        return acc;
      }

      const attribute = key.slice(FACET_KEY_PREFIX.length);
      const values = value.filter(
        (item): item is string => typeof item === 'string'
      );

      if (attribute && values.length > 0) {
        acc.push(values.map((item) => `${attribute}:${item}`));
      }

      return acc;
    },
    []
  );

  return facetFilters.length > 0 ? facetFilters : undefined;
};

/**
 * Extracts the refinements a search tool searched with, in the shape
 * `applyFilters` expects.
 *
 * The default search tool provides a ready-to-use `facet_filters` array. The
 * Algolia MCP Server search tool instead expresses refinements as individual
 * `facet_<attribute>` keys (e.g. `facet_categories: ['Books', 'Toys']`), which
 * are converted here into `[['attribute:value']]`.
 */
export const getApplyFiltersParamsFromToolInput = (
  input: SearchToolInput | undefined
): ApplyFiltersParams => {
  const query = getSearchToolQuery(input);

  return {
    query: query?.query,
    facetFilters: getFacetFilters(query),
  };
};
