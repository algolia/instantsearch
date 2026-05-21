import { wait } from '@instantsearch/testutils';
import { Chat } from 'instantsearch.js/es/lib/chat';
import userEvent from '@testing-library/user-event';

import type { Act } from '../../common';

export const createDefaultWidgetParams = (chat?: Chat<any>) => ({
  agentId: 'agentId',
  chat: chat ?? new Chat({}),
});

/**
 * Opens the chat by clicking the `chatTrigger` widget's toggle button.
 *
 * Tests using this helper must register a `chatTrigger` widget (in
 * `instantsearch.js`) or render `<ChatTrigger />` (in `react-instantsearch`)
 * alongside the `chat` widget. The trigger renders an `.ais-ChatToggleButton`
 * element, which we click here.
 */
export async function openChat(act: Act) {
  await act(async () => {
    await wait(0);
  });

  const toggleButton = document.querySelector<HTMLButtonElement>(
    '.ais-ChatToggleButton'
  );

  if (!toggleButton) {
    throw new Error(
      'openChat() requires a `chatTrigger` widget (or `<ChatTrigger />` in React) ' +
        'to be mounted so that an `.ais-ChatToggleButton` element exists.'
    );
  }

  userEvent.click(toggleButton);

  await act(async () => {
    await wait(0);
  });
}
