/**
 * @jest-environment jsdom
 */
import chat from '../../widgets/chat/chat';
import chatTrigger from '../../widgets/chat-trigger/chat-trigger';
import { createAlgoliaProvider } from '../AlgoliaProvider';

describe('createAlgoliaProvider', () => {
  test('mounts chat and chatTrigger without instantsearch()', async () => {
    const chatContainer = document.createElement('div');
    const triggerContainer = document.createElement('div');
    document.body.append(chatContainer, triggerContainer);

    const provider = createAlgoliaProvider({ appId: 'app', apiKey: 'key' });
    provider
      .addWidgets([
        chat({
          container: chatContainer,
          agentId: 'agent',
          requiresSearch: false,
          disableTriggerValidation: true,
        }),
        chatTrigger({ container: triggerContainer }),
      ])
      .start();

    const button = triggerContainer.querySelector('button')!;
    expect(chatContainer.querySelector('.ais-Chat-container--open')).toBeNull();
    expect(button.classList).not.toContain('ais-ChatToggleButton--open');

    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The trigger found the chat through the provider's shared render state,
    // opened it, and re-rendered itself from the chat's new state.
    expect(
      chatContainer.querySelector('.ais-Chat-container--open')
    ).not.toBeNull();
    expect(button.classList).toContain('ais-ChatToggleButton--open');

    provider.dispose();
  });
});
