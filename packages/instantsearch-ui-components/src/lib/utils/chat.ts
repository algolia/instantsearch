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
import type { RecordWithObjectID } from '../../types';

// Keep in sync with packages/instantsearch.js/src/lib/chat/index.ts
const SearchIndexToolType = 'algolia_search_index';

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

const isSearchToolPart = (part: ChatToolMessage) =>
  part.type === `tool-${SearchIndexToolType}` ||
  // Compatibility shim with Algolia MCP Server search tool
  startsWith(part.type, `tool-${SearchIndexToolType}_`);

const collectHitsFromPart = (
  part: ChatToolMessage,
  hitsByObjectID: Record<string, RecordWithObjectID>
) => {
  const output =
    part.state === 'output-available'
      ? (part.output as { hits?: RecordWithObjectID[] } | undefined)
      : undefined;
  const hits = output?.hits;

  if (!Array.isArray(hits)) {
    return;
  }

  hits.forEach((hit) => {
    if (!hit) {
      return;
    }

    if (typeof hit.objectID === 'string' && hit.objectID !== '') {
      hitsByObjectID[hit.objectID] = hit;
    }
  });
};

/**
 * Builds a map of `objectID` -> full record by collecting the hits from search
 * tool outputs across the conversation.
 *
 * The display results tool only receives object IDs from the backend, so it
 * relies on this map to hydrate each result with the full record that the
 * preceding search tool already fetched.
 *
 * Pass the display tool's own message part to scope collection to that exact
 * occurrence. This prevents reused tool call IDs and later searches from
 * changing another display tool's records or per-query metadata like
 * `__queryID`.
 */
export const getHitsByObjectID = (
  messages: ChatMessageBase[],
  untilToolPart?: ChatToolMessage
): Record<string, RecordWithObjectID> => {
  const hitsByObjectID = Object.create(null) as Record<
    string,
    RecordWithObjectID
  >;

  const reachedBoundary = messages.some((message) =>
    message.parts.some((part) => {
      if (!isPartTool(part)) {
        return false;
      }

      if (untilToolPart && part === untilToolPart) {
        return true;
      }

      if (isSearchToolPart(part)) {
        collectHitsFromPart(part, hitsByObjectID);
      }

      return false;
    })
  );

  if (untilToolPart && !reachedBoundary) {
    return Object.create(null) as Record<string, RecordWithObjectID>;
  }

  return hitsByObjectID;
};
