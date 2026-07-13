import type { ChatRenderState } from '../../connectors/chat/connectChat';

/**
 * Identifies which entry point triggered the chat completion request.
 * Forwarded to the agent backend as the `x-algolia-referer` header and used
 * as a correlation tag for attribution.
 */
export type ChatReferer =
  | 'prompt-suggestions'
  | 'ai-mode'
  | 'on-page-suggestions'
  | 'page-summary';

export type OpenChatOptions = {
  /**
   * Text to submit to the chat as a user message. Empty or whitespace-only
   * values open the chat without sending anything.
   */
  message?: string;
  /**
   * Source that triggered the chat. When provided, the value is sent as the
   * `x-algolia-referer` header on the resulting chat completion request so
   * the backend can attribute the traffic to the originating entry point.
   */
  referer?: ChatReferer;
  /**
   * Ambient page context attached to the outgoing user message as
   * `metadata.turnContext` — the same Agent Studio grounding channel the chat
   * widget's own `context` uses. Lets an entry point ground the agent's answer
   * in the page it was triggered from. Flat `Record<string, string>` per the
   * backend contract. Ignored when the chat widget already attaches its own
   * `context` (that one takes precedence for the turn).
   */
  turnContext?: Record<string, string>;
};

// Centralizes the "open the chat from an entry point" behavior shared by the
// SearchBox AI button, the Autocomplete AI button, prompt suggestions, and any
// future entry point. The chat is always opened; the message is only sent when
// it is non-empty and the chat is not already processing a message.
// Returns true when a message was submitted, so callers can clear their input.
export function openChat(
  chatRenderState: Partial<ChatRenderState> | undefined,
  { message, referer, turnContext }: OpenChatOptions = {}
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

  if (isChatBusy(chatRenderState) || !chatRenderState.sendMessage) {
    return false;
  }

  chatRenderState.sendMessage(
    {
      text: trimmed,
      ...(turnContext ? { metadata: { turnContext } } : {}),
    } as Parameters<NonNullable<typeof chatRenderState.sendMessage>>[0],
    referer ? { headers: { 'x-algolia-referer': referer } } : undefined
  );
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
