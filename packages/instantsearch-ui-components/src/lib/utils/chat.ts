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

type ToolNameMatcher = {
  matchesToolName?: (toolName: string) => boolean;
};

/**
 * Resolves the tool a message part belongs to, from either a part type
 * (`tool-algolia_search_index`) or a bare tool name.
 *
 * An exact registration wins. Otherwise only tools whose `matchesToolName`
 * claims the name are considered, most specific first, for servers that name a
 * call after the registered tool: the Algolia MCP Server appends the index name
 * (`algolia_search_index_products`).
 *
 * Generic over the tool shape: the renderer, the loader, the widget and the
 * connector hold different subsets of the tool contract.
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

      const registered = prefixes.map((key) => `"${key}"`).join(', ');

      warn(
        prefixes.length === 0,
        `No tool is registered for "${toolName}". ${
          prefixes.length > 1
            ? `The registered tools ${registered} are prefixes of it`
            : `The registered tool ${registered} is a prefix of it`
        }, but a prefix alone doesn't resolve: declare \`matchesToolName\` on the tool that should handle "${toolName}".`
      );
    }

    return undefined;
  }

  // Most specific claim wins, ties by name, so the winner doesn't depend on
  // registration order.
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

/**
 * A numeric facet value as the Algolia MCP Server emits it: an operator
 * followed by a number (`'<=1500'`). Mirrors that server's own
 * `NUMERIC_FILTER_REGEX` so the two sides cannot drift.
 */
const NUMERIC_FACET_VALUE = /^(<=|>=|=|!=|<|>)\s*(-?\d+(\.\d+)?)$/;

const isNumericFacetValues = (values: string[]): boolean =>
  values.length > 0 && values.every((value) => NUMERIC_FACET_VALUE.test(value));

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
      if (!startsWith(key, FACET_KEY_PREFIX)) {
        return acc;
      }

      const attribute = key.slice(FACET_KEY_PREFIX.length);

      if (!attribute) {
        return acc;
      }

      // A boolean facet arrives as a primitive, not an array.
      if (typeof value === 'boolean') {
        acc.push([`${attribute}:${value}`]);
        return acc;
      }

      if (!Array.isArray(value)) {
        return acc;
      }

      const values = value.filter(
        (item): item is string => typeof item === 'string'
      );

      if (values.length === 0) {
        return acc;
      }

      // A numeric facet needs a numeric refinement, which this shape cannot
      // express. `price:<=1500` would refine on a value no record holds, so the
      // search would quietly return the wrong results. Dropping it loses the
      // filter instead, which the user can see. Track 2 applies it properly
      // from the tool's resolved search params.
      if (isNumericFacetValues(values)) {
        return acc;
      }

      acc.push(values.map((item) => `${attribute}:${item}`));

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
