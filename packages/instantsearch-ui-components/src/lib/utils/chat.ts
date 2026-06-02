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
  messages: ChatMessageBase[],
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
