/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createSearchClient } from '@instantsearch/mocks';

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

    test('warns with an item without a `value`', () => {
      const searchClient = createSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        hitsPerPage({
          container: document.createElement('div'),
          items: [
            // @ts-expect-error Incomplete item
            { label: '10', default: true },
          ],
        }),
      ]);

      expect(() => search.start())
        .toWarnDev(`[InstantSearch.js]: The \`items\` option of \`hitsPerPage\` does not contain the "hits per page" value coming from the state: undefined.

You may want to add another entry to the \`items\` option with this value.`);
    });
  });
});
