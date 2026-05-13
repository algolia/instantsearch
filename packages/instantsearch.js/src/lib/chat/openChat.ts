import type { ChatRenderState } from '../../connectors/chat/connectChat';

export type OpenChatOptions = {
  /**
   * Text to submit to the chat as a user message. Empty or whitespace-only
   * values open the chat without sending anything.
   */
  message?: string;
};

// Centralizes the "open the chat from an entry point" behavior shared by the
// SearchBox AI button, the Autocomplete AI button, prompt suggestions, and any
// future entry point. The chat is always opened; the message is only sent when
// it is non-empty and the chat is not already processing a message.
// Returns true when a message was submitted, so callers can clear their input.
export function openChat(
  chatRenderState: Partial<ChatRenderState> | undefined,
  { message }: OpenChatOptions = {}
): boolean {
  if (!chatRenderState) {
    return false;
  }

  chatRenderState.setOpen?.(true);

  const trimmed = message?.trim() ?? '';
  if (!trimmed) {
    chatRenderState.focusInput?.();
    return false;
  }

  if (isChatBusy(chatRenderState)) {
    return false;
  }

  chatRenderState.sendMessage?.({ text: trimmed });
  return true;
}

export function isChatBusy(
  chatRenderState: Partial<ChatRenderState> | undefined
): boolean {
  return (
    chatRenderState?.status === 'submitted' ||
    chatRenderState?.status === 'streaming'
  );
}
