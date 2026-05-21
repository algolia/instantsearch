import { warning } from '../utils';

import type { AbstractChat, UIMessage } from '../ai-lite';

export type ChatContext =
  | Record<string, unknown>
  | (() => Record<string, unknown>);

/**
 * Wraps a chat instance's `sendMessage` so that the configured page/widget
 * context is serialized to JSON, wrapped in `<context>…</context>` and
 * prepended to the user message as a text part. Returns a function that has
 * the same shape as `Chat#sendMessage`.
 *
 * When `context` is undefined, or the message is empty, the original
 * `sendMessage` is called unchanged.
 */
export function createSendMessageWithContext<TUiMessage extends UIMessage>(
  chat: AbstractChat<TUiMessage>,
  context: ChatContext | undefined
): typeof chat.sendMessage {
  const sendMessage: typeof chat.sendMessage = (message, ...rest) => {
    if (!context || !message) {
      return chat.sendMessage(message, ...rest);
    }

    const resolvedContext = typeof context === 'function' ? context() : context;

    let serializedContext: string;
    try {
      serializedContext = JSON.stringify(resolvedContext);
    } catch {
      warning(
        false,
        'Could not serialize chat context. The message will be sent without context.'
      );
      return chat.sendMessage(message, ...rest);
    }

    const contextTextPart = {
      type: 'text' as const,
      text: '<context>'.concat(serializedContext).concat('</context>'),
    };

    if ('parts' in message && message.parts) {
      return chat.sendMessage(
        {
          ...message,
          parts: [contextTextPart, ...message.parts],
          text: undefined,
          files: undefined,
        },
        ...rest
      );
    }

    const textContent = 'text' in message && message.text ? message.text : '';

    return chat.sendMessage(
      {
        parts: [contextTextPart, { type: 'text' as const, text: textContent }],
        metadata: message.metadata,
        messageId: message.messageId,
        files: undefined,
        text: undefined,
      },
      ...rest
    );
  };

  return sendMessage;
}
