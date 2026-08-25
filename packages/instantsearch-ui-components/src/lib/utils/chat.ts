import { startsWith } from './startsWith';

import type { ChatMessageBase } from '../../components';
import type {
  ApplyFiltersParams,
  ChatToolMessage,
  SearchToolInput,
  SearchToolQuery,
} from '../../components/chat/types';

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

/**
 * Whether a text part renders nothing. `text-start` creates the part before its
 * first delta, and `<context>` wrappers are a shim `ChatMessage` also drops.
 */
export const isPartTextEmpty = (
  part: Extract<ChatMessageBase['parts'][number], { type: 'text' }>
): boolean => {
  return (
    part.text.trim().length === 0 ||
    (part.text.startsWith('<context>') && part.text.endsWith('</context>'))
  );
};

/**
 * Whether a part says something about the turn's progress. Data parts and
 * unwritten text parts render nothing, so reading them would answer "what is
 * this turn doing" with a part that changed nothing on screen.
 */
export const isPartProgressSignal = (
  part: ChatMessageBase['parts'][number]
): boolean => {
  if (startsWith(part.type, 'data-')) {
    return false;
  }
  if (isPartText(part)) {
    return !isPartTextEmpty(part);
  }
  return true;
};

export const findLastProgressPart = (
  parts: ChatMessageBase['parts'] | undefined
): ChatMessageBase['parts'][number] | undefined => {
  if (!parts) {
    return undefined;
  }

  for (let index = parts.length - 1; index >= 0; index--) {
    const part = parts[index];
    if (isPartProgressSignal(part)) {
      return part;
    }
  }

  return undefined;
};

const TOOL_PART_PREFIX = 'tool-';

/**
 * Resolves the tool a message part belongs to, from either a part type
 * (`tool-algolia_search_index`) or a bare tool name.
 *
 * Generic over the tool shape so the renderer, the loader and the connector —
 * which hold different subsets of the tool contract — all resolve names the same
 * way.
 */
export const findTool = <TTool>(
  partType: string,
  tools: Record<string, TTool>
): TTool | undefined => {
  const toolName = startsWith(partType, TOOL_PART_PREFIX)
    ? partType.slice(TOOL_PART_PREFIX.length)
    : partType;

  if (tools[toolName]) {
    return tools[toolName];
  }

  // Compatibility shim for tool names suffixed by the index name, as the Algolia
  // MCP Server does (`algolia_search_index_products`). The longest matching key
  // wins, so registering both `foo` and `foo_bar` resolves `foo_bar_products` to
  // `foo_bar` — otherwise the winner would depend on registration order.
  let match: string | undefined;

  Object.keys(tools).forEach((key) => {
    if (
      startsWith(toolName, `${key}_`) &&
      (match === undefined || key.length > match.length)
    ) {
      match = key;
    }
  });

  return match === undefined ? undefined : tools[match];
};

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
