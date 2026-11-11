import { AbstractChat } from 'instantsearch.js/es/lib/ai-lite';
import { useSyncExternalStore } from 'react';

import type { Product } from '../types';
import type {
  ChatState,
  ChatStatus,
  ChatTransport,
  UIMessage,
} from 'instantsearch.js/es/lib/ai-lite';

/** Custom data parts of the agent stream (`data-<name>` chunks). */
export type AgentDataTypes = {
  reasoning: { text: string };
  'agent-text': { text: string };
  hits: { hits: Product[] };
  /** Candidates the agent found but didn't pick, for "Show more". */
  'more-hits': { hits: Product[] };
  metadata: Record<string, unknown>;
};

export type AgentMessage = UIMessage<unknown, AgentDataTypes>;

export type ChatSnapshot = {
  messages: AgentMessage[];
  status: ChatStatus;
  error: Error | undefined;
};

/** `ChatState` that React can subscribe to with `useSyncExternalStore`. */
class SubscribableChatState implements ChatState<AgentMessage> {
  private current: ChatSnapshot = {
    messages: [],
    status: 'ready',
    error: undefined,
  };
  private listeners = new Set<() => void>();

  private update(patch: Partial<ChatSnapshot>) {
    this.current = { ...this.current, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  get status() {
    return this.current.status;
  }
  set status(status: ChatStatus) {
    this.update({ status });
  }

  get error() {
    return this.current.error;
  }
  set error(error: Error | undefined) {
    this.update({ error });
  }

  get messages() {
    return this.current.messages;
  }
  set messages(messages: AgentMessage[]) {
    this.update({ messages: [...messages] });
  }

  pushMessage = (message: AgentMessage) => {
    this.update({ messages: [...this.current.messages, message] });
  };

  popMessage = () => {
    this.update({ messages: this.current.messages.slice(0, -1) });
  };

  replaceMessage = (index: number, message: AgentMessage) => {
    const messages = [...this.current.messages];
    messages[index] = this.snapshot(message);
    this.update({ messages });
  };

  snapshot = <T>(thing: T): T => structuredClone(thing);

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.current;
}

/** Text of every user turn, in order: the `queries` the agent receives. */
export function getQueries(messages: AgentMessage[]): string[] {
  return messages
    .filter((message) => message.role === 'user')
    .map((message) =>
      message.parts
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('')
    );
}

/**
 * One agentic conversation. Built on ai-lite's `AbstractChat`, which handles
 * the streaming state, regenerating and aborting the previous request. Each
 * user turn is a new request carrying the whole query list and the current
 * filters (see `transports.ts`); nothing is kept server-side.
 */
export class AgentChat extends AbstractChat<AgentMessage> {
  readonly store: SubscribableChatState;
  /** The search that switched to agentic mode. */
  readonly originalQuery: string;
  /** Which agent or endpoint the conversation talks to. */
  readonly key: string;

  constructor({
    transport,
    originalQuery,
    key,
  }: {
    transport: ChatTransport<AgentMessage>;
    originalQuery: string;
    key: string;
  }) {
    const store = new SubscribableChatState();
    super({ state: store, transport });
    this.store = store;
    this.originalQuery = originalQuery;
    this.key = key;
  }
}

const EMPTY_SNAPSHOT: ChatSnapshot = {
  messages: [],
  status: 'ready',
  error: undefined,
};
const noopSubscribe = () => () => {};

export function useChatSnapshot(chat: AgentChat | null): ChatSnapshot {
  return useSyncExternalStore(
    chat ? chat.store.subscribe : noopSubscribe,
    chat ? chat.store.getSnapshot : () => EMPTY_SNAPSHOT
  );
}

export type AgentTurn = {
  reasoning: string;
  answer: string;
  hits: Product[];
  moreHits: Product[];
};

function isTextPayload(data: unknown): data is { text: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as { text?: unknown }).text === 'string'
  );
}

function isProduct(hit: unknown): hit is Product {
  return (
    typeof hit === 'object' &&
    hit !== null &&
    typeof (hit as Product).objectID === 'string' &&
    typeof (hit as Product).name === 'string'
  );
}

/**
 * Folds the data parts of the latest agent reply into what the panel shows.
 * ai-lite doesn't validate data-part payloads, so every shape is checked.
 */
export function readLatestTurn(messages: AgentMessage[]): AgentTurn {
  const turn: AgentTurn = { reasoning: '', answer: '', hits: [], moreHits: [] };
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant') return turn;

  last.parts.forEach((part) => {
    if (part.type === 'data-reasoning' && isTextPayload(part.data)) {
      turn.reasoning += part.data.text;
    } else if (part.type === 'data-agent-text' && isTextPayload(part.data)) {
      turn.answer += part.data.text;
    } else if (part.type === 'data-hits' || part.type === 'data-more-hits') {
      const hits = (part.data as { hits?: unknown } | undefined)?.hits;
      if (Array.isArray(hits)) {
        // Appended in arrival order, no deduplication.
        const target = part.type === 'data-hits' ? turn.hits : turn.moreHits;
        target.push(...hits.filter(isProduct));
      }
    }
  });

  return turn;
}
