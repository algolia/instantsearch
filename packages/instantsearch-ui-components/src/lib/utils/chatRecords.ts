import { isPartTool } from './chat';

import type { ChatMessageBase } from '../../components';

/** A record as a tool returned it, before any display-time annotation. */
export type ChatRecord = Record<string, unknown> & { objectID: string };

export type ChatRecords = Record<string, ChatRecord>;

/**
 * The records the chat's tools have fetched, keyed by `objectID`: the shared
 * lookup between the tools that search and the tools handed only identifiers.
 */
export type ChatRecordsStore = {
  get: (objectID: string) => ChatRecord | undefined;
  has: (objectID: string) => boolean;
  /** The current map, not a copy — read-only, and replaced by `clear()`. */
  getAll: () => ChatRecords;
  /** Last write wins per `objectID`; records without one are skipped. */
  merge: (records: Array<ChatRecord | null | undefined>) => void;
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
 * Collects into `store` the records of every completed tool call in `messages`
 * whose output holds `hits`. Matching on the output rather than on a tool name
 * means any tool that fetches records contributes them by returning them.
 *
 * Idempotent, so it can re-run over the whole conversation on every update:
 * streaming deltas and a conversation restored from storage are one code path.
 */
export function collectChatRecords(
  messages: ChatMessageBase[] | undefined,
  store: ChatRecordsStore = createChatRecordsStore()
): ChatRecordsStore {
  messages?.forEach((message) => {
    message.parts.forEach((part) => {
      if (!isPartTool(part) || part.state !== 'output-available') {
        return;
      }

      const { hits } = (part.output ?? {}) as { hits?: ChatRecord[] };

      if (Array.isArray(hits)) {
        store.merge(hits);
      }
    });
  });

  return store;
}
