import { startsWith } from './startsWith';

import type { ChatMessageBase } from '../../components';
import type {
  ApplyFiltersParams,
  ChatToolMessage,
  ClientSideTool,
  ClientSideTools,
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
