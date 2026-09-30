import type {
  UIMessage,
  ToolUIPart,
  DynamicToolUIPart,
  UITools,
} from './types';

export function isToolPart(
  part: UIMessage['parts'][number]
): part is UIMessage['parts'][number] & { state: string } {
  return part.type.indexOf('tool-') === 0 || part.type === 'dynamic-tool';
}

/**
 * Whether the reasoning part at `index` is the one still being produced, i.e.
 * it is streaming and nothing settled has followed it.
 */
export function isReasoningPartActive(
  parts: UIMessage['parts'],
  index: number
): boolean {
  const part = parts[index];

  return (
    part?.type === 'reasoning' &&
    part.state === 'streaming' &&
    !parts
      .slice(index + 1)
      .some(
        (laterPart) =>
          laterPart.type !== 'reasoning' || laterPart.state === 'streaming'
      )
  );
}

/**
 * Whether a text part renders nothing. `text-start` creates the part before its
 * first delta, and `<context>` wrappers are a shim the view drops as well.
 */
function isTextPartEmpty(part: { text: string }): boolean {
  return (
    part.text.trim().length === 0 ||
    (part.text.startsWith('<context>') && part.text.endsWith('</context>'))
  );
}

/**
 * Whether a part says anything about the turn's progress. Data parts and
 * unwritten text parts render nothing, so letting them answer "what is this
 * turn doing" would report progress that changed nothing on screen.
 */
export function isProgressPart(part: UIMessage['parts'][number]): boolean {
  if (part.type.indexOf('data-') === 0) {
    return false;
  }
  if (part.type === 'text') {
    return !isTextPartEmpty(part);
  }

  return true;
}

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

  // Only the last step of the message counts: earlier steps were answered
  // before the model was called again, so their resolved tool calls must not
  // continue the turn a second time.
  const lastStepStartIndex = lastMessage.parts.reduce(
    (lastIndex, part, index) =>
      part.type === 'step-start' ? index : lastIndex,
    -1
  );

  const toolParts = lastMessage.parts
    .slice(lastStepStartIndex + 1)
    .filter(isToolOrDynamicToolUIPart)
    // A provider-executed tool call is the provider's to answer, so a turn
    // made of them is already complete — continuing would resend it.
    .filter((part) => !part.providerExecuted);

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
