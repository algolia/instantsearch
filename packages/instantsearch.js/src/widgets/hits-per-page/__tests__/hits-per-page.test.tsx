/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { findAllByRole, findByRole } from '@testing-library/dom';

import instantsearch from '../../../index.es';
import hitsPerPage from '../hits-per-page';

describe('hitsPerPage', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          hitsPerPage({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits-per-page/js/"
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
        hitsPerPage({
          container,
          items: [
            { label: '10', value: 10, default: true },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
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

      const root = container.firstChild;
      const select = await findByRole(container, 'combobox');
      const options = await findAllByRole(container, 'option');

      expect(root).toHaveClass('ROOT');
      expect(select).toHaveClass('SELECT');
      options.forEach((option) => expect(option).toHaveClass('OPTION'));
    });
  });
});
