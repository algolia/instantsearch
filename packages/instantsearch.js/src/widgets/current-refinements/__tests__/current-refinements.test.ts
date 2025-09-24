/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import instantsearch from '../../../index.es';
import refinementList from '../../refinement-list/refinement-list';
import currentRefinements from '../current-refinements';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('currentRefinements', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        // @ts-expect-error
        currentRefinements({ container: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/current-refinements/js/"
      `);
    });

    test('adds custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
              categories: ['Audio'],
            },
          },
        },
      });

      search.addWidgets([
        currentRefinements({
          container,
          cssClasses: {
            root: 'ROOT',
            noRefinementRoot: 'NO_REFINEMENT_ROOT',
            list: 'LIST',
            item: 'ITEM',
          },
        }),
      ]);
      search.start();

      await wait(0);

      expect(container.querySelector('.ais-CurrentRefinements')).toHaveClass(
        'ROOT',
        'NO_REFINEMENT_ROOT'
      );
      expect(
        container.querySelector('.ais-CurrentRefinements-list')
      ).toHaveClass('LIST');

      search.addWidgets([
        refinementList({
          container: document.createElement('div'),
          attribute: 'brand',
        }),
      ]);

      await wait(0);

      expect(
        container.querySelector('.ais-CurrentRefinements-item')
      ).toHaveClass('ITEM');
    });
  });
});
