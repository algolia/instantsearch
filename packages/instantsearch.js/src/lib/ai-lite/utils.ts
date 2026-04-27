import type {
  UIMessage,
  ToolUIPart,
  DynamicToolUIPart,
  UITools,
} from './types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function isToolOrDynamicToolUIPart(
  part: unknown
): part is ToolUIPart<UITools> | DynamicToolUIPart {
  if (typeof part !== 'object' || part === null) return false;
  const p = part as { type?: string };
  return (
    typeof p.type === 'string' &&
    (p.type.startsWith('tool-') || p.type === 'dynamic-tool')
  );
}

export function lastAssistantMessageIsCompleteWithToolCalls({
  messages,
}: {
  messages: UIMessage[];
}): boolean {
  if (messages.length === 0) return false;

  const lastMessage = messages[messages.length - 1];

  if (lastMessage.role !== 'assistant') return false;

  if (!lastMessage.parts || lastMessage.parts.length === 0) return false;

  const toolParts = lastMessage.parts.filter(isToolOrDynamicToolUIPart);

  if (toolParts.length === 0) return false;

  return toolParts.every(
    (part) => part.state === 'output-available' || part.state === 'output-error'
  );
}

export class SerialJobExecutor {
  private queue: Array<() => Promise<void>> = [];
  private isRunning = false;

  run<T>(job: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(() => {
        return job().then(
          (result) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
      });

      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const processNext = (): void => {
      if (this.queue.length === 0) {
        this.isRunning = false;
        return;
      }

      const job = this.queue.shift();
      if (job) {
        job().then(processNext, processNext);
      }
    };

    processNext();
  }
}

export function resolveValue<T>(
  value: T | (() => T) | (() => Promise<T>) | undefined
): Promise<T | undefined> {
  if (value === undefined) return Promise.resolve(undefined);
  if (typeof value === 'function') {
    return Promise.resolve((value as () => T | Promise<T>)());
  }
  return Promise.resolve(value);
}

function messageFromErrorObject(o: Record<string, unknown>): string | undefined {
  const direct =
    (typeof o.error === 'string' && o.error.trim()) ||
    (typeof o.message === 'string' && o.message.trim());
  if (direct) {
    return direct;
  }
  const nested = o.error;
  if (nested && typeof nested === 'object') {
    const ne = nested as Record<string, unknown>;
    return (
      (typeof ne.message === 'string' && ne.message.trim()) ||
      (typeof ne.error === 'string' && ne.error.trim()) ||
      undefined
    );
  }
  return undefined;
}

/**
 * Turns chat stream `error` chunk `errorText` into a short user-facing string.
 * Handles plain text, single JSON objects (`error` / `message`), and
 * double-encoded JSON strings returned by some APIs.
 */
export function getMessageFromStreamErrorText(errorText: string): string {
  const trimmed = errorText.trim();
  if (!trimmed) {
    return 'Unknown error';
  }

  let remaining: unknown = trimmed;
  for (let depth = 0; depth < 5; depth++) {
    if (typeof remaining === 'string') {
      const s = remaining.trim();
      if (!s) {
        break;
      }
      try {
        remaining = JSON.parse(s) as unknown;
        continue;
      } catch {
        return s;
      }
    }

    if (remaining && typeof remaining === 'object' && !Array.isArray(remaining)) {
      const o = remaining as Record<string, unknown>;
      const msg = messageFromErrorObject(o);
      if (msg) {
        return msg;
      }
      if (typeof o.type === 'string' && o.type.trim()) {
        return o.type.trim();
      }
      break;
    }

    break;
  }

  if (typeof remaining === 'string') {
    return remaining.trim() || trimmed;
  }
  return trimmed;
}
