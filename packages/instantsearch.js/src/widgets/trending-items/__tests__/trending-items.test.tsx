/**
 * @jest-environment jsdom
 */
/** @jsx h */
import {
  createSearchClient,
  createSingleSearchResponse,
  createRecommendResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import trendingItems from '../trending-items';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('trendingItems', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          trendingItems({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/trending-items/js/"
      `);
    });

    test('adds custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
      const options: Parameters<typeof trendingItems>[0] = {
        container,
        cssClasses: {
          root: 'ROOT',
          emptyRoot: 'EMPTY_ROOT',
          title: 'TITLE',
          container: 'CONTAINER',
          list: 'LIST',
          item: 'ITEM',
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const trendingItemsWidget = trendingItems(options);

      search.addWidgets([trendingItemsWidget]);

      search.start();

      await wait(0);

      expect(container.querySelector('.ais-TrendingItems')).toHaveClass('ROOT');
      expect(container.querySelector('.ais-TrendingItems-title')).toHaveClass(
        'TITLE'
      );
      expect(
        container.querySelector('.ais-TrendingItems-container')
      ).toHaveClass('CONTAINER');
      expect(container.querySelector('.ais-TrendingItems-list')).toHaveClass(
        'LIST'
      );
      expect(container.querySelector('.ais-TrendingItems-item')).toHaveClass(
        'ITEM'
      );

      search.removeWidgets([trendingItemsWidget]);

      search.addWidgets([trendingItems({ ...options, limit: 0 })]);

      await wait(0);

      expect(container.querySelector('.ais-TrendingItems')).toHaveClass(
        'ROOT',
        'EMPTY_ROOT'
      );
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
      const options: Parameters<typeof trendingItems>[0] = {
        container,
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const trendingItemsWidget = trendingItems(options);

      search.addWidgets([trendingItemsWidget]);

      // @MAJOR Once Hogan.js and string-based templates are removed,
      // `search.start()` can be moved to the test body and the following
      // assertion can go away.
      expect(async () => {
        search.start();

        await wait(0);
      }).not.toWarnDev();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingItems"
          >
            <h3
              class="ais-TrendingItems-title"
            >
              Trending items
            </h3>
            <div
              class="ais-TrendingItems-container"
            >
              <ol
                class="ais-TrendingItems-list"
              >
                <li
                  class="ais-TrendingItems-item"
                >
                  {
          "objectID": "1"
        }
                </li>
                <li
                  class="ais-TrendingItems-item"
                >
                  {
          "objectID": "2"
        }
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      search.removeWidgets([trendingItemsWidget]);

      search.addWidgets([trendingItems({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingItems ais-TrendingItems--empty"
          >
            No results
          </section>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
      const options: Parameters<typeof trendingItems>[0] = {
        container,
        templates: {
          header({ recommendations, cssClasses }, { html }) {
            return html`<h4 class="${cssClasses.title}">
              Trending items (${recommendations.length})
            </h4>`;
          },
          item(item, { html }) {
            return html`<p>${item.objectID}</p>`;
          },
          empty(_, { html }) {
            return html`<p>No recommendations.</p>`;
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const trendingItemsWidget = trendingItems(options);

      search.addWidgets([trendingItemsWidget]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingItems"
          >
            <h4
              class="ais-TrendingItems-title"
            >
              Trending items (
              2
              )
            </h4>
            <div
              class="ais-TrendingItems-container"
            >
              <ol
                class="ais-TrendingItems-list"
              >
                <li
                  class="ais-TrendingItems-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  class="ais-TrendingItems-item"
                >
                  <p>
                    2
                  </p>
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      search.removeWidgets([trendingItemsWidget]);

      search.addWidgets([trendingItems({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingItems ais-TrendingItems--empty"
          >
            <p>
              No recommendations.
            </p>
          </section>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
      const options: Parameters<typeof trendingItems>[0] = {
        container,
        templates: {
          header({ recommendations, cssClasses }) {
            return (
              <h4 className={cssClasses.title}>
                Trending items ({recommendations.length})
              </h4>
            );
          },
          item(item) {
            return <p>{item.objectID}</p>;
          },
          empty() {
            return <p>No recommendations.</p>;
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const trendingItemsWidget = trendingItems(options);

      search.addWidgets([trendingItemsWidget]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingItems"
          >
            <h4
              class="ais-TrendingItems-title"
            >
              Trending items (
              2
              )
            </h4>
            <div
              class="ais-TrendingItems-container"
            >
              <ol
                class="ais-TrendingItems-list"
              >
                <li
                  class="ais-TrendingItems-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  class="ais-TrendingItems-item"
                >
                  <p>
                    2
                  </p>
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      search.removeWidgets([trendingItemsWidget]);

      search.addWidgets([trendingItems({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingItems ais-TrendingItems--empty"
          >
            <p>
              No recommendations.
            </p>
          </section>
        </div>
      `);
    });
  });
});

function createMockedSearchClient() {
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createRecommendResponse(
          // @ts-ignore
          // `request` will be implicitly typed as `any` in type-check:v3
          // since `getRecommendations` is not available there
          requests.map((request) => {
            return createSingleSearchResponse<any>({
              hits:
                request.maxRecommendations === 0
                  ? []
                  : [{ objectID: '1' }, { objectID: '2' }],
            });
          })
        )
      )
    ),
  });
}
