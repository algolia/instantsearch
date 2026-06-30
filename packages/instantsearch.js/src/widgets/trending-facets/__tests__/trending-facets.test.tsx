/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import {
  createRecommendResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks/createAPIResponse';
import { createSearchClient } from '@instantsearch/mocks/createSearchClient';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import trendingFacets from '../trending-facets';

function createTrendingFacetsSearchClient() {
  const fixture = [
    { facetName: 'brand', facetValue: 'Apple', _score: 95 },
    { facetName: 'brand', facetValue: 'Samsung', _score: 87 },
  ];
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createRecommendResponse(
          requests.map((request: any) =>
            createSingleSearchResponse({
              // @ts-expect-error trending facet items aren't Hit objects
              hits: fixture.slice(
                0,
                typeof request.maxRecommendations === 'number'
                  ? Math.min(request.maxRecommendations, fixture.length)
                  : fixture.length
              ),
            })
          )
        )
      )
    ),
  });
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('trendingFacets', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createTrendingFacetsSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          trendingFacets({
            // @ts-expect-error
            container: undefined,
            facetName: 'brand',
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/trending-facets/js/"
      `);
    });

    test('adds custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createTrendingFacetsSearchClient();
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        facetName: 'brand',
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
      const widget = trendingFacets(options);

      search.addWidgets([widget]);

      search.start();

      await wait(0);

      expect(container.querySelector('.ais-TrendingFacets')).toHaveClass(
        'ROOT'
      );
      expect(container.querySelector('.ais-TrendingFacets-title')).toHaveClass(
        'TITLE'
      );
      expect(
        container.querySelector('.ais-TrendingFacets-container')
      ).toHaveClass('CONTAINER');
      expect(container.querySelector('.ais-TrendingFacets-list')).toHaveClass(
        'LIST'
      );
      expect(container.querySelector('.ais-TrendingFacets-item')).toHaveClass(
        'ITEM'
      );

      search.removeWidgets([widget]);

      search.addWidgets([trendingFacets({ ...options, limit: 0 })]);

      await wait(0);

      expect(container.querySelector('.ais-TrendingFacets')).toHaveClass(
        'ROOT',
        'EMPTY_ROOT'
      );
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createTrendingFacetsSearchClient();
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        facetName: 'brand',
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = trendingFacets(options);

      search.addWidgets([widget]);

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
            class="ais-TrendingFacets"
          >
            <h3
              class="ais-TrendingFacets-title"
            >
              Trending
            </h3>
            <div
              class="ais-TrendingFacets-container"
            >
              <ol
                class="ais-TrendingFacets-list"
              >
                <li
                  class="ais-TrendingFacets-item"
                >
                  Apple
                </li>
                <li
                  class="ais-TrendingFacets-item"
                >
                  Samsung
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      search.removeWidgets([widget]);

      search.addWidgets([trendingFacets({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets ais-TrendingFacets--empty"
          >
            No results
          </section>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createTrendingFacetsSearchClient();
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        facetName: 'brand',
        templates: {
          header({ items, cssClasses }, { html }) {
            return html`<h4 class="${cssClasses.title}">
              Trending facets (${items.length})
            </h4>`;
          },
          item(item, { html }) {
            return html`<p>${item.facetValue}</p>`;
          },
          empty(_, { html }) {
            return html`<p>No trending facets.</p>`;
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = trendingFacets(options);

      search.addWidgets([widget]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets"
          >
            <h4
              class="ais-TrendingFacets-title"
            >
              Trending facets (
              2
              )
            </h4>
            <div
              class="ais-TrendingFacets-container"
            >
              <ol
                class="ais-TrendingFacets-list"
              >
                <li
                  class="ais-TrendingFacets-item"
                >
                  <p>
                    Apple
                  </p>
                </li>
                <li
                  class="ais-TrendingFacets-item"
                >
                  <p>
                    Samsung
                  </p>
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      search.removeWidgets([widget]);

      search.addWidgets([trendingFacets({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets ais-TrendingFacets--empty"
          >
            <p>
              No trending facets.
            </p>
          </section>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createTrendingFacetsSearchClient();
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        facetName: 'brand',
        templates: {
          header({ items, cssClasses }) {
            return (
              <h4 className={cssClasses.title}>
                Trending facets ({items.length})
              </h4>
            );
          },
          item(item) {
            return <p>{item.facetValue}</p>;
          },
          empty() {
            return <p>No trending facets.</p>;
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = trendingFacets(options);

      search.addWidgets([widget]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets"
          >
            <h4
              class="ais-TrendingFacets-title"
            >
              Trending facets (
              2
              )
            </h4>
            <div
              class="ais-TrendingFacets-container"
            >
              <ol
                class="ais-TrendingFacets-list"
              >
                <li
                  class="ais-TrendingFacets-item"
                >
                  <p>
                    Apple
                  </p>
                </li>
                <li
                  class="ais-TrendingFacets-item"
                >
                  <p>
                    Samsung
                  </p>
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      search.removeWidgets([widget]);

      search.addWidgets([trendingFacets({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets ais-TrendingFacets--empty"
          >
            <p>
              No trending facets.
            </p>
          </section>
        </div>
      `);
    });

    test('renders empty state', async () => {
      const container = document.createElement('div');
      const searchClient = createTrendingFacetsSearchClient();
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        facetName: 'brand',
        limit: 0,
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = trendingFacets(options);

      search.addWidgets([widget]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets ais-TrendingFacets--empty"
          >
            No results
          </section>
        </div>
      `);
    });
  });
});
