import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch.js/es/lib/chat';

import type { Act } from '../../common';

export const createDefaultWidgetParams = (chat?: Chat<any>) => ({
  agentId: 'agentId',
  chat: chat ?? new Chat({}),
});

export async function openChat(act: Act) {
  await act(async () => {
    await wait(0);
  });

  userEvent.click(document.querySelector('.ais-ChatToggleButton')!);

  await act(async () => {
    await wait(0);
  });
}
