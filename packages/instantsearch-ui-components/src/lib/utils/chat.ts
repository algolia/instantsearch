import { startsWith } from './startsWith';

import type { ChatMessageBase } from '../../components';
import type {
  ChatToolMessage,
  ClientSideTool,
  ClientSideTools,
  SearchToolInput,
} from '../../components/chat/types';

export const getTextContent = (message: ChatMessageBase) => {
  return message.parts
    .map((part) => ('text' in part ? part.text : ''))
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

/**
 * Extracts the `facetFilters` from a search tool input.
 *
 * The default search tool provides a ready-to-use `facet_filters` array. The
 * Algolia MCP Server search tool instead expresses refinements as individual
 * `facet_<attribute>` keys (e.g. `facet_categories: ['Books', 'Toys']`), which
 * are converted here into the `[['attribute:value']]` shape `applyFilters`
 * expects.
 */
export const getFacetFiltersFromToolInput = (
  input: SearchToolInput | undefined
): string[][] | undefined => {
  if (!input) {
    return undefined;
  }

  if (Array.isArray(input.facet_filters)) {
    return input.facet_filters;
  }

  const facetFilters = Object.entries(input).reduce<string[][]>(
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
