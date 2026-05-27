import type { AbstractChat, UIMessage } from '../ai-lite';

export type ChatContext =
  | Record<string, string>
  | (() => Record<string, string>);

/**
 * Wraps a chat instance's `sendMessage` so that the configured page/widget
 * context is attached to the user message as `metadata.turnContext` per the
 * Agent Studio contract. Returns a function with the same shape as
 * `Chat#sendMessage`.
 *
 * When `context` is undefined, or the message is empty, the original
 * `sendMessage` is called unchanged. A throwing `context` resolver is
 * surfaced to the caller rather than swallowed.
 */
export function createSendMessageWithContext<TUiMessage extends UIMessage>(
  chat: AbstractChat<TUiMessage>,
  context: ChatContext | undefined
): typeof chat.sendMessage {
  const sendMessage: typeof chat.sendMessage = (message, ...rest) => {
    if (!context || !message) {
      return chat.sendMessage(message, ...rest);
    }

    const turnContext = typeof context === 'function' ? context() : context;

    return chat.sendMessage(
      {
        ...message,
        metadata: {
          ...(message.metadata as Record<string, unknown> | undefined),
          turnContext,
        },
      } as Parameters<typeof chat.sendMessage>[0],
      ...rest
    );
  };

  return sendMessage;
}
