import { isPartTool } from './chat';

import type { ChatMessageBase } from '../../components';

/** A record as a tool returned it, before any display-time annotation. */
export type ChatRecord = Record<string, unknown> & { objectID: string };

export type ChatRecords = Record<string, ChatRecord>;

/**
 * The records the conversation holds, keyed by `objectID`: what the chat's
 * tools fetched plus what the shopper selected for a comparison — the shared
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
 * Turn-context key under which the compare connector attaches the shopper's
 * selection to its user message (`metadata.turnContext.selected_products`), as
 * a JSON-encoded array of records — the Agent Studio comparison contract.
 */
const SELECTED_PRODUCTS_KEY = 'selected_products';

/**
 * The records a user message carries as a comparison selection, or `[]` when
 * it carries none. The payload is client-authored, so anything unexpected
 * (not JSON, not an array) is treated as "no records" rather than thrown.
 */
function selectedRecords(message: ChatMessageBase): ChatRecord[] {
  if (message.role !== 'user') {
    return [];
  }

  const turnContext = (
    message.metadata as
      | { turnContext?: Record<string, unknown> | null }
      | undefined
      | null
  )?.turnContext;
  const raw = turnContext?.[SELECTED_PRODUCTS_KEY];

  if (typeof raw !== 'string') {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatRecord[]) : [];
  } catch {
    return [];
  }
}

/**
 * Collects into `store` the records of every completed tool call in `messages`
 * whose output holds `hits`, plus the records a user message carries as a
 * comparison selection. Matching on the output rather than on a tool name
 * means any tool that fetches records contributes them by returning them; the
 * selection counts because the compare flow already hands the agent the very
 * records it is asked to compare, so the table can be built from them without
 * a search round-trip.
 *
 * Idempotent, so it can re-run over the whole conversation on every update:
 * streaming deltas and a conversation restored from storage are one code path.
 * Later messages win per `objectID`, so a record the agent re-fetched after the
 * selection replaces the selected copy.
 */
export function collectChatRecords(
  messages: ChatMessageBase[] | undefined,
  store: ChatRecordsStore = createChatRecordsStore()
): ChatRecordsStore {
  messages?.forEach((message) => {
    store.merge(selectedRecords(message));

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
