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
