/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import instantsearch from '../../../index.es';
import sortBy from '../sort-by';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('sortBy', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          sortBy({
            // @ts-expect-error
            container: undefined,
            items: [
              { label: 'Featured', value: 'instant_search' },
              { label: 'Price (asc)', value: 'instant_search_price_asc' },
              { label: 'Price (desc)', value: 'instant_search_price_desc' },
            ],
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/sort-by/js/"
      `);
    });

    test('add custom CSS classes', async () => {
      const container = document.createElement('div');

      const searchClient = createSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        sortBy({
          container,
          items: [
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ],
          cssClasses: {
            root: 'ROOT',
            select: 'SELECT',
            option: 'OPTION',
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container.firstChild).toHaveClass('ROOT');
      expect(container.querySelector('.ais-SortBy-select')).toHaveClass(
        'SELECT'
      );
      container.querySelectorAll('.ais-SortBy-option').forEach((option) => {
        expect(option).toHaveClass('OPTION');
      });
    });
  });
});
