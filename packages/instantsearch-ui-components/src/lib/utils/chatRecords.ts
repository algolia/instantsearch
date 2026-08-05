import { findTool, isPartTool } from './chat';

import type { ChatMessageBase } from '../../components';
import type { ChatToolMessage } from '../../components/chat/types';

/**
 * A record as a tool returned it. Display-time annotations (`__position`, …) are
 * added by whichever tool presents it, so a stored record carries only its
 * identifier and its own fields.
 */
export type ChatRecord = Record<string, unknown> & { objectID: string };

export type ChatRecords = Record<string, ChatRecord>;

/**
 * Reads the records a completed call of a tool fetched. A tool declares one so
 * the records it holds become available to the tools that are handed only object
 * IDs — see `ClientSideTool.getRecords`.
 */
export type ChatToolRecordsGetter = (
  part: ChatToolMessage
) => ChatRecord[] | undefined;

/**
 * The records the chat's tools have fetched, keyed by `objectID`.
 *
 * Tools that search return full records, while the tools that present them are
 * handed only identifiers. This store is the shared lookup between the two, and
 * knows nothing about either: what counts as a record in a given output is the
 * contributing tool's own business.
 *
 * Every contribution merges into one map, a later one overwriting an earlier one
 * for the same `objectID` — the newest copy of a record is the accurate one, so
 * staleness resolves itself.
 */
export type ChatRecordsStore = {
  /**
   * The record for an `objectID`, or `undefined` when nothing has contributed it.
   */
  get: (objectID: string) => ChatRecord | undefined;
  /**
   * Whether a record is available for an `objectID`.
   */
  has: (objectID: string) => boolean;
  /**
   * Every record collected so far. The live map, not a copy — treat it as
   * read-only, and prefer `get`/`has` for lookups.
   */
  getAll: () => ChatRecords;
  /**
   * Adds records, keyed by their `objectID`. Records without a usable one are
   * skipped. Merging the same records again is a no-op, which is what lets a
   * caller re-merge freely rather than track what it has already seen.
   */
  merge: (records: Array<ChatRecord | null | undefined>) => void;
  /**
   * Drops every record. For starting a new conversation, so a cleared one's
   * records aren't retained.
   */
  clear: () => void;
};

const createRecords = (): ChatRecords => Object.create(null) as ChatRecords;

const hasOwn = (records: ChatRecords, objectID: string) =>
  Object.prototype.hasOwnProperty.call(records, objectID);

export function createChatRecordsStore(): ChatRecordsStore {
  let records = createRecords();

  return {
    get: (objectID) =>
      hasOwn(records, objectID) ? records[objectID] : undefined,
    has: (objectID) => hasOwn(records, objectID),
    getAll: () => records,
    merge: (contributed) => {
      contributed.forEach((record) => {
        if (
          record &&
          typeof record.objectID === 'string' &&
          record.objectID !== ''
        ) {
          records[record.objectID] = record;
        }
      });
    },
    clear: () => {
      records = createRecords();
    },
  };
}

/**
 * Collects into `store` the records of every completed tool call in `messages`,
 * asking each call's own tool what it fetched.
 *
 * Because merging is keyed by `objectID` and idempotent, this can run over a
 * whole conversation on every update: a streaming delta and a conversation
 * restored from storage are then the same code path, and no bookkeeping of
 * what has already been merged is needed.
 */
export function collectChatRecords(
  messages: ChatMessageBase[] | undefined,
  tools: Record<string, { getRecords?: ChatToolRecordsGetter } | undefined>,
  store: ChatRecordsStore = createChatRecordsStore()
): ChatRecordsStore {
  messages?.forEach((message) => {
    message.parts.forEach((part) => {
      if (!isPartTool(part)) {
        return;
      }

      const contributed = findTool(part.type, tools)?.getRecords?.(part);

      if (contributed) {
        store.merge(contributed);
      }
    });
  });

  return store;
}

/**
 * A ready-made `getRecords` for a tool whose output holds an Algolia `hits`
 * array, which is the shape the search and recommend tools return.
 */
export const getHitsFromToolOutput: ChatToolRecordsGetter = (part) => {
  const output =
    part.state === 'output-available'
      ? (part.output as { hits?: ChatRecord[] } | undefined)
      : undefined;

  return Array.isArray(output?.hits) ? output.hits : undefined;
};
