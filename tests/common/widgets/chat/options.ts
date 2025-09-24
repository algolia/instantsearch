import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch.js/es/lib/chat';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createSearchClient();

      const chat = new Chat({});
      const sendMessageSpy = jest.spyOn(chat, 'sendMessage');

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'agentId',
          chat,
        },
      });

      await act(async () => {
        await wait(0);
      });

      userEvent.click(document.querySelector('.ais-ChatToggleButton')!);

      await act(async () => {
        await wait(0);
      });

      userEvent.type(
        document.querySelector('.ais-ChatPrompt-textarea')!,
        'Hello, world!'
      );
      userEvent.click(document.querySelector('.ais-ChatPrompt-submit')!);

      await act(async () => {
        await wait(0);
      });

      expect(sendMessageSpy).toHaveBeenCalledWith({ text: 'Hello, world!' });
    });
  });
}
