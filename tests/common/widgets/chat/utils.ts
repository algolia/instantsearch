import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { Act } from '../../common';
import type { Chat } from 'instantsearch.js/es/lib/chat';

export const createDefaultWidgetParams = (chat?: Chat<any>) =>
  chat === undefined ? { agentId: 'agentId' } : { chat };

// The chat is opened by clicking the `chatTrigger` widget's button; tests
// using this helper must mount a `chatTrigger`/`<ChatTrigger />` alongside the
// `chat` widget so that an `.ais-ChatToggleButton` is in the DOM.
export async function openChat(act: Act) {
  await act(async () => {
    await wait(0);
  });

  userEvent.click(document.querySelector('.ais-ChatToggleButton')!);

  await act(async () => {
    await wait(0);
  });
}
