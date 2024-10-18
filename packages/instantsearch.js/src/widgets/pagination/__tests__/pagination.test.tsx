/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { findByLabelText, findByRole } from '@testing-library/dom';

import instantsearch from '../../../index.es';
import pagination from '../pagination';

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
        (await findByLabelText(container, 'First Page')).parentNode,
        (await findByLabelText(container, 'Previous Page')).parentNode,
        (await findByLabelText(container, 'Next Page')).parentNode,
        (await findByLabelText(container, 'Last Page, Page 0')).parentNode,
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
});
