/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { findByLabelText, findByRole } from '@testing-library/dom';

import instantsearch from '../../../index.es';
import configure from '../../configure/configure';
import pagination from '../pagination';

import type { SearchResponse } from '../../../../src/types';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('pagination', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          pagination({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/pagination/js/"
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
        pagination({
          container,
          cssClasses: {
            root: 'ROOT',
            noRefinementRoot: 'NO_REFINEMENT_ROOT',
            list: 'LIST',
            item: 'ITEM',
            firstPageItem: 'FIRST_PAGE_ITEM',
            lastPageItem: 'LAST_PAGE_ITEM',
            previousPageItem: 'PREVIOUS_PAGE_ITEM',
            nextPageItem: 'NEXT_PAGE_ITEM',
            pageItem: 'PAGE_ITEM',
            selectedItem: 'SELECTED_ITEM',
            disabledItem: 'DISABLED_ITEM',
            link: 'LINK',
          },
        }),
      ]);

      search.start();

      await wait(0);

      const root = container.firstChild;

      const [
        list,
        firstPageItem,
        previousPageItem,
        nextPageItem,
        lastPageItem,
        pageLink,
      ] = await Promise.all([
        findByRole(container, 'list'),
        (await findByLabelText(container, 'First')).parentNode,
        (await findByLabelText(container, 'Previous')).parentNode,
        (await findByLabelText(container, 'Next')).parentNode,
        (await findByLabelText(container, 'Last')).parentNode,
        findByRole(container, 'link', { name: 'Page 1' }),
      ]);

      expect(root).toHaveClass('ROOT', 'NO_REFINEMENT_ROOT');
      expect(list).toHaveClass('LIST');
      expect(firstPageItem).toHaveClass(
        'FIRST_PAGE_ITEM',
        'ITEM',
        'DISABLED_ITEM'
      );
      expect(previousPageItem).toHaveClass(
        'PREVIOUS_PAGE_ITEM',
        'ITEM',
        'DISABLED_ITEM'
      );
      expect(nextPageItem).toHaveClass(
        'NEXT_PAGE_ITEM',
        'ITEM',
        'DISABLED_ITEM'
      );
      expect(lastPageItem).toHaveClass(
        'LAST_PAGE_ITEM',
        'ITEM',
        'DISABLED_ITEM'
      );
      expect(pageLink.parentNode).toHaveClass(
        'ITEM',
        'PAGE_ITEM',
        'SELECTED_ITEM'
      );
      expect(pageLink).toHaveClass('LINK');
    });
  });

  describe('templates', () => {
    test('does not warn with default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        configure({ hitsPerPage: 1 }),
        pagination({ container }),
      ]);

      // @MAJOR Once Hogan.js and string-based templates are removed,
      // `search.start()` can be moved to the test body and the following
      // assertion can go away.
      expect(async () => {
        search.start();

        await wait(0);
      }).not.toWarnDev();

      await wait(0);
    });

    type CustomHit = { name: string; description: string };

    function createMockedSearchClient(
      subset: Partial<SearchResponse<CustomHit>> = {}
    ) {
      return createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) => {
                return createSingleSearchResponse<any>({
                  index: request.indexName,
                  query: request.params?.query,
                  hits: [
                    {
                      objectID: '1',
                      name: 'Apple iPhone smartphone',
                      description: 'A smartphone by Apple.',
                      _highlightResult: {
                        name: {
                          value: `Apple iPhone <mark>smartphone</mark>`,
                          matchLevel: 'full' as const,
                          matchedWords: ['smartphone'],
                        },
                      },
                      _snippetResult: {
                        name: {
                          value: `Apple iPhone <mark>smartphone</mark>`,
                          matchLevel: 'full' as const,
                        },
                        description: {
                          value: `A <mark>smartphone</mark> by Apple.`,
                          matchLevel: 'full' as const,
                        },
                      },
                    },
                  ],
                  page: 0,
                  nbPages: 3,
                  ...subset,
                });
              })
            )
          );
        }),
      });
    }
  });
});
