/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import instantsearch from '../../../index.es';
import chat from '../chat';

describe('chat', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({ indexName: 'indexName', searchClient });

        search.addWidgets([
          chat({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/chat/js/"
      `);
    });

    test('adds custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = chat({
        container,
        agentId: 'agentId',
        cssClasses: {
          container: 'CONTAINER',
        },
      });

      search.addWidgets([widget]);
      search.start();
      await wait(0);

      userEvent.click(container.querySelector('.ais-ChatToggleButton')!);
      await wait(0);

      expect(container.querySelector('.ais-Chat-container')).toHaveClass(
        'CONTAINER'
      );
    });
  });
});
