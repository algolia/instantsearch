import { wait } from '@instantsearch/testutils';
import { Chat } from 'instantsearch.js/es/lib/chat';

import type { Act } from '../../common';

declare global {
  // eslint-disable-next-line no-var
  var __chatTestSetOpen: ((open: boolean) => void) | null;
}

globalThis.__chatTestSetOpen = null;

export const createDefaultWidgetParams = (chat?: Chat<any>) => ({
  agentId: 'agentId',
  chat: chat ?? new Chat({}),
});

export async function openChat(act: Act) {
  await act(async () => {
    await wait(0);
  });

  const setOpen = globalThis.__chatTestSetOpen;

  if (setOpen == null) {
    throw new Error(
      'openChat() requires globalThis.__chatTestSetOpen to be set by the test setup.'
    );
  }

  setOpen(true);

  await act(async () => {
    await wait(0);
  });
}
