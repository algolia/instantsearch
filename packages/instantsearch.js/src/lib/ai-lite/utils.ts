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

  const allResolved = toolParts.every(
    (part) => part.state === 'output-available' || part.state === 'output-error'
  );

  if (!allResolved) return false;

  // A resolved tool call that marked itself `terminal` (a display/render-only
  // tool) carries nothing the model needs to act on. If EVERY resolved tool
  // call is terminal, the turn is done — do not fire an automatic follow-up
  // completion. This is what stops display tools (e.g. product cards) from
  // looping: the tool is still resolved server-side (no dangling call), it just
  // doesn't re-invoke the model. A single non-terminal result (a data tool the
  // model must reason about) keeps today's auto-continue behavior, so legitimate
  // multi-tool turns are unaffected.
  const everyResolvedToolIsTerminal = toolParts.every(
    (part) => part.state === 'output-available' && part.terminal === true
  );

  return !everyResolvedToolIsTerminal;
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

/**
 * Error shape for custom chat implementations that still surface a
 * `data-guardrail-violation` chunk through the error UI. The `message` carries
 * the service-provided `fallbackResponse`, which is authored for end-user
 * display.
 *
 * Detection across package boundaries should rely on `error.name` rather than
 * `instanceof` to avoid issues with mixed module copies in bundled apps.
 */
export class GuardrailViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardrailViolationError';
  }
}

/**
 * Reads a non-empty `message` field off a JSON-serialized error envelope.
 *
 * Both transports backing `AbstractChat` (stream `error` chunks and HTTP error
 * responses) serialize errors as `{"message": "...", ...}` — the same shape as
 * the shared `ErrorResponse` on the API side. Returns the trimmed message if
 * the input is such a JSON object, otherwise `undefined`.
 */
export function tryParseErrorMessage(text: string): string | undefined {
  try {
    const parsed: unknown = JSON.parse(text);
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      typeof (parsed as { message?: unknown }).message === 'string'
    ) {
      const message = (parsed as { message: string }).message.trim();
      if (message) {
        return message;
      }
    }
  } catch {
    // Not JSON — caller falls back to its own default.
  }
  return undefined;
}
