import { warning } from '../utils';

import type { ChatRenderState } from '../../connectors/chat/connectChat';

/**
 * Identifies which entry point triggered the chat completion request.
 * Forwarded to the agent backend as the `x-algolia-referer` header and used
 * as a correlation tag for attribution.
 */
export type ChatReferer =
  | 'ai-mode'
  | 'compare'
  | 'prompt-suggestions-widget'
  | 'prompt-suggestions-autocomplete'
  | 'result-card'
  // Custom entry points tag themselves; the built-in values still autocomplete.
  | (string & {});

export type OpenChatOptions = {
  /**
   * Text to submit to the chat as a user message. Empty or whitespace-only
   * values open the chat without sending anything. Ignored when `shortcut`
   * is set.
   */
  message?: string;
  /**
   * Prompt shortcut to send instead of a message. The agent runs the prompt
   * saved under this `id`, and the chat shows the display text the agent
   * returns for it, if any, as the user message. Values for the shortcut's
   * placeholders go in `turnContext`.
   *
   * The `id` starts with a letter, followed by 2 to 63 letters, digits,
   * underscores or hyphens. With any other value, nothing is sent and the
   * chat is not opened. An id that passes this check can still be unknown to
   * the agent.
   */
  shortcut?: { id: string };
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
   * backend contract. Merged with the chat widget's own `context` when it has
   * one; on a key both provide, this value wins for the turn.
   */
  turnContext?: Record<string, string>;
};

// A prompt-shortcut sentinel (`__ALGOLIA_<KIND>_<id>__`, e.g. the `compare`
// widget's configured comparison) stands for a prompt the server holds; the
// server also decides what the transcript shows for it. Mirrors the backend's
// matching: SCREAMING_SNAKE kind, then an id that starts with a letter and
// runs 3-64 word characters/hyphens (`SHORTCUT_ID_PATTERN` on the backend).
const PROMPT_SHORTCUT_SENTINEL =
  /^__ALGOLIA_[A-Z][A-Z_]*_[A-Za-z][\w-]{2,63}__$/;
// A shortcut message stays hidden until the server echoes its display text,
// so the id is held to the grammar the backend accepts: nothing else can be
// sent unseen.
const PROMPT_SHORTCUT_ID = /^[A-Za-z][\w-]{2,63}$/;

// Centralizes the "open the chat from an entry point" behavior shared by the
// SearchBox AI button, the Autocomplete AI button, prompt suggestions, and any
// future entry point. The chat is always opened; the message is only sent when
// it is non-empty and the chat is not already processing a message. The one
// exception is a `shortcut` with an invalid id, which leaves the chat closed.
// Returns true when a message was submitted, so callers can clear their input.
export function openChat(
  chatRenderState: Partial<ChatRenderState> | undefined,
  { message, referer, turnContext, shortcut }: OpenChatOptions = {}
): boolean {
  if (!chatRenderState) {
    return false;
  }

  let trimmed = message?.trim() ?? '';
  let isPromptShortcut = PROMPT_SHORTCUT_SENTINEL.test(trimmed);
  if (shortcut) {
    const { id } = shortcut;
    if (typeof id !== 'string' || !PROMPT_SHORTCUT_ID.test(id)) {
      warning(
        false,
        `The \`shortcut.id\` given to \`openChat\` is not a valid prompt shortcut id: ${
          typeof id === 'string' ? JSON.stringify(id) : typeof id
        }. It must start with a letter, followed by 2 to 63 letters, digits, underscores or hyphens. Nothing was sent.`
      );
      return false;
    }
    warning(
      !trimmed,
      '`openChat` received both `shortcut` and `message`. The shortcut is sent and `message` is ignored.'
    );
    trimmed = `__SHORTCUT_${id}__`;
    isPromptShortcut = true;
  }

  if (!trimmed) {
    if (chatRenderState.focusInput) {
      chatRenderState.focusInput();
    } else {
      chatRenderState.setOpen?.(true);
    }
    return false;
  }

  chatRenderState.setOpen?.(true);

  if (isChatBusy(chatRenderState) || !chatRenderState.sendMessage) {
    return false;
  }

  // Marking a sentinel as a pending prompt shortcut keeps its bubble hidden
  // until the server echoes the text to show (see `applyPromptShortcutEcho`
  // in `connectChat`) — or for good, when the shortcut is silent.
  const metadata = {
    ...(turnContext ? { turnContext } : {}),
    ...(isPromptShortcut ? { promptShortcut: { sentinel: trimmed } } : {}),
  };

  chatRenderState.sendMessage(
    {
      text: trimmed,
      ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
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
