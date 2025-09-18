import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const mockSendMessage = jest.fn();
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'foo',
          chat: {
            sendMessage: mockSendMessage,
            '~registerErrorCallback': (_onChange: () => void) => {},
            '~registerMessagesCallback': (_onChange: () => void) => {},
            '~registerStatusCallback': (_onChange: () => void) => {},
          },
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

      expect(mockSendMessage).toHaveBeenCalledWith({ text: 'Hello, world!' });
    });
  });
}
