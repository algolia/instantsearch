import { warn } from '../../warn';

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

const TOOL_PART_PREFIX = 'tool-';

type ToolNameMatcher = {
  matchesToolName?: (toolName: string) => boolean;
};

/**
 * Resolves the tool a message part belongs to, from either a part type
 * (`tool-algolia_search_index`) or a bare tool name.
 *
 * A tool registered under the exact name always wins. Failing that, only tools
 * that opted in through `matchesToolName` can claim the name, which is how a
 * server that derives the name it sends from the registered one is supported —
 * the Algolia MCP Server exposes the search tool once per index and appends the
 * index name (`algolia_search_index_products`).
 *
 * Claiming is explicit rather than inferred from the name because `a_b` is
 * genuinely ambiguous between the tool `a_b` and the tool `a` addressing `b`.
 * No naming rule tells those apart, so guessing picks the wrong tool for
 * somebody: preferring the shorter key breaks `foo_bar` when `foo` is also
 * registered, preferring the longer one breaks `search_index` on the `products`
 * index when `search_index_products` is also registered.
 *
 * Generic over the tool shape so the renderer, the loader, the widget and the
 * connector — which hold different subsets of the tool contract — all resolve
 * names the same way.
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

  const claimants = Object.keys(tools).filter((key) =>
    Boolean(
      (tools[key] as ToolNameMatcher | undefined)?.matchesToolName?.(toolName)
    )
  );

  if (claimants.length === 0) {
    if (__DEV__) {
      const prefixes = Object.keys(tools)
        .filter((key) => startsWith(toolName, `${key}_`))
        .sort();

      warn(
        prefixes.length === 0,
        `No tool is registered for "${toolName}". The registered ${prefixes
          .map((key) => `"${key}"`)
          .join(
            ', '
          )} is a prefix of it, but a prefix alone doesn't resolve: declare \`matchesToolName\` on it to also handle "${toolName}".`
      );
    }

    return undefined;
  }

  // Sorted rather than first-found, so the winner never depends on the order
  // tools were registered in: the most specific claim wins, ties by name.
  claimants.sort((a, b) => b.length - a.length || (a < b ? -1 : 1));

  if (__DEV__) {
    warn(
      claimants.length === 1,
      `Multiple tools claim "${toolName}" through \`matchesToolName\`: ${claimants
        .map((key) => `"${key}"`)
        .join(', ')}. "${claimants[0]}" handles it.`
    );
  }

  return tools[claimants[0]];
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
