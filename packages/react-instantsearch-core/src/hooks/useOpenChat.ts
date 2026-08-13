import { isChatBusy, openChat } from 'instantsearch.js/es/lib/chat';
import { useCallback, useMemo } from 'react';

import { useIndexContext } from '../lib/useIndexContext';
import { useInstantSearchContext } from '../lib/useInstantSearchContext';
import { useInstantSearchServerContext } from '../lib/useInstantSearchServerContext';
import { useSearchState } from '../lib/useSearchState';
import { useWidget } from '../lib/useWidget';
import { warn } from '../lib/warn';

import type { UiState, Widget } from 'instantsearch.js';
import type { OpenChatOptions } from 'instantsearch.js/es/lib/chat';

export type UseOpenChatResult = {
  /**
   * Whether the chat widget on the same index is currently open.
   */
  open: boolean;
  /**
   * Opens that chat widget, optionally submitting a message to it. Without a
   * message, the chat is opened and its input focused. Returns `true` when a
   * message was submitted.
   */
  openChat: (options?: OpenChatOptions) => boolean;
  /**
   * Whether the chat is submitting or streaming a message, and so can't accept
   * a new one. `false` until the chat has initialized.
   */
  isChatBusy: boolean;
};

const noop = () => {};

const NO_PROPS = {};

/**
 * Opens the `<Chat>` widget mounted on the same index, optionally submitting a
 * message to it — for a custom entry point that isn't the `<ChatTrigger>`
 * button (a hero CTA, a keyboard shortcut, an "ask about this product" link).
 */
export function useOpenChat(): UseOpenChatResult {
  const search = useInstantSearchContext();
  const parentIndex = useIndexContext();
  const serverContext = useInstantSearchServerContext();
  const { indexRenderState } = useSearchState<UiState>();

  // Marks the hook as a chat entry point for `connectChat`'s validation.
  // `dependsOn: 'none'` keeps it from making the index require a search.
  const widget = useMemo(
    () =>
      ({
        $$type: 'ais.chatOpener',
        opensChat: true,
        dependsOn: 'none',
        init: noop,
        dispose: noop,
      }) as unknown as Widget,
    []
  );

  useWidget({
    widget,
    parentIndex,
    props: NO_PROPS,
    shouldSsr: Boolean(serverContext),
    skipSuspense: true,
  });

  const chatRenderState = indexRenderState.chat;

  // Resolved at call time, not from this render's snapshot: an entry point can
  // hold on to the callback far longer than one render.
  const handleOpenChat = useCallback(
    (options?: OpenChatOptions) => {
      const chat = search.renderState[parentIndex.getIndexId()]?.chat;

      warn(
        Boolean(chat),
        'You are using `useOpenChat()` on an index that has no `<Chat>` widget, so there is nothing to open.'
      );

      return openChat(chat, options);
    },
    [search, parentIndex]
  );

  return {
    open: chatRenderState?.open ?? false,
    openChat: handleOpenChat,
    isChatBusy: chatRenderState
      ? !chatRenderState.sendMessage || isChatBusy(chatRenderState)
      : false,
  };
}
