import { startsWith } from './startsWith';

import type { ChatMessageBase } from '../../components';
import type {
  ChatToolMessage,
  ClientSideTool,
  ClientSideTools,
} from '../../components/chat/types';
import type { RecordWithObjectID } from '../../types';

// Keep in sync with packages/instantsearch.js/src/lib/chat/index.ts
const SearchIndexToolType = 'algolia_search_index';

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

const isSearchToolPart = (part: ChatToolMessage) =>
  part.type === `tool-${SearchIndexToolType}` ||
  // Compatibility shim with Algolia MCP Server search tool
  startsWith(part.type, `tool-${SearchIndexToolType}_`);

// Memoize the map per `messages` array reference. The chat connector hands out
// a new array only when the conversation actually changes, so this rebuilds on
// real updates (e.g. streaming) and returns the cached map on every unrelated
// re-render — the display tool can call this freely without recomputing.
const hitsByObjectIDCache = new WeakMap<
  object,
  Record<string, RecordWithObjectID>
>();

/**
 * Builds a map of `objectID` -> full record by collecting the hits from every
 * search tool output across the conversation.
 *
 * The display results tool only receives object IDs from the backend, so it
 * relies on this map to hydrate each result with the full record that the
 * preceding search tool already fetched.
 */
export const getHitsByObjectID = (
  messages: ChatMessageBase[]
): Record<string, RecordWithObjectID> => {
  const cached = hitsByObjectIDCache.get(messages);
  if (cached) {
    return cached;
  }

  const hitsByObjectID: Record<string, RecordWithObjectID> = {};

  messages.forEach((message) => {
    message.parts.forEach((part) => {
      if (!isPartTool(part) || !isSearchToolPart(part)) {
        return;
      }

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

        // The display results tool references records by their bare `id` (the
        // backend strips the prefix from `objectID`, e.g. it sends `"84254"`
        // for a hit whose `objectID` is `"media-sample-data-84254"`),
        // so index by `id` as well to hydrate those too.
        const id = (hit as { id?: string | number }).id;
        if (id !== undefined && id !== null && id !== '') {
          hitsByObjectID[String(id)] = hit;
        }
      });
    });
  });

  hitsByObjectIDCache.set(messages, hitsByObjectID);

  return hitsByObjectID;
};
