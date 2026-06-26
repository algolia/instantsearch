import { isPartTool, startsWith } from 'instantsearch-core';

import type { SearchToolInput, UIMessage } from 'instantsearch-core';
import type { RecordWithObjectID } from '../types';

type ChatToolMessage = Extract<
  UIMessage['parts'][number],
  { type: `tool-${string}` }
>;

// Keep in sync with packages/instantsearch.js/src/lib/chat/index.ts
const SearchIndexToolType = 'algolia_search_index';

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
 * Pass `untilToolCallId` (the display tool's own `toolCallId`) to scope
 * collection to the turn that produced it: hits are only gathered up to and
 * including the message that contains that tool call. This prevents a later
 * turn's search from overwriting an earlier display tool's records (and their
 * per-query metadata like `__queryID`).
 */
export const getHitsByObjectID = (
  messages: UIMessage[],
  untilToolCallId?: string
): Record<string, RecordWithObjectID> => {
  const hitsByObjectID: Record<string, RecordWithObjectID> = {};

  for (const message of messages) {
    let reachedBoundary = false;

    message.parts.forEach((part) => {
      if (!isPartTool(part)) {
        return;
      }
      // Note the boundary but keep processing the rest of this message's parts:
      // the search tool that fed this display tool lives in the same message,
      // so its hits must still be collected before we stop.
      if (untilToolCallId && part.toolCallId === untilToolCallId) {
        reachedBoundary = true;
      }
      if (isSearchToolPart(part)) {
        collectHitsFromPart(part, hitsByObjectID);
      }
    });

    if (reachedBoundary) {
      break;
    }
  }

  return hitsByObjectID;
};
