import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { skippableDescribe } from '../../common';

import type { ChatConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createOptionsTests(
  setup: ChatConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('options', skippedTests, () => {
    test('throws when no agentId or transport are provided', async () => {
      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {},
      };

      await expect(async () => {
        await setup(options);
      }).rejects.toThrowErrorMatchingInlineSnapshot(`
              "You need to provide either an \`agentId\` or a \`transport\`.

              See documentation: https://www.algolia.com/doc/api-reference/widgets/chat/js/#connector"
            `);
    });

    test('provides `input` state to persist text input', async () => {
      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          agentId: 'agentId',
        },
      };

      await setup(options);

      expect(screen.getByTestId('Chat-input')).toHaveValue('');

      userEvent.click(screen.getByTestId('Chat-updateInput'));

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByTestId('Chat-input')).toHaveValue('hello world');
    });

    test('provides `open` state to toggle chat visibility', async () => {
      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          agentId: 'agentId',
        },
      };

      await setup(options);

      expect(screen.getByTestId('Chat-root')).not.toBeVisible();

      userEvent.click(screen.getByTestId('Chat-toggleButton'));

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByTestId('Chat-root')).toBeVisible();
    });
  });
}
