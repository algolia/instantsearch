/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import { carousel } from '../../../templates';
import trendingItems from '../trending-items';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('trendingItems', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createRecommendSearchClient();

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
      const searchClient = createRecommendSearchClient();
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
      const searchClient = createRecommendSearchClient({
        minimal: true,
      });
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
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof trendingItems>[0] = {
        container,
        templates: {
          header({ items, cssClasses }, { html }) {
            return html`<h4 class="${cssClasses.title}">
              Trending items (${items.length})
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

    test('renders with a custom layout using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof trendingItems>[0] = {
        container,
        templates: {
          layout({ items }, { html }) {
            return html`<ul>
              ${items.map((item) => html`<li><p>${item.objectID}</p></li>`)}
            </ul>`;
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = trendingItems(options);

      search.addWidgets([widget]);
      search.start();

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
            <ul>
              <li>
                <p>
                  1
                </p>
              </li>
              <li>
                <p>
                  2
                </p>
              </li>
            </ul>
          </section>
        </div>
      `);
    });

    test('renders with a carousel layout using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof trendingItems>[0] = {
        container,
        templates: {
          item(hit, { html }) {
            return html`<p>${hit.objectID}</p>`;
          },
          layout: carousel({
            cssClasses: {
              root: 'ROOT',
              list: 'LIST',
              item: 'ITEM',
              navigation: 'NAVIGATION',
              navigationNext: 'NAVIGATION_NEXT',
              navigationPrevious: 'NAVIGATION_PREVIOUS',
            },
            templates: {
              previous({ html }) {
                return html`<p>Previous</p>`;
              },
              next({ html }) {
                return html`<p>Next</p>`;
              },
            },
          }),
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = trendingItems(options);

      search.addWidgets([widget]);
      search.start();

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
              class="ais-Carousel ROOT"
            >
              <button
                aria-controls="ais-Carousel-0"
                aria-label="Previous"
                class="ais-Carousel-navigation NAVIGATION ais-Carousel-navigation--previous NAVIGATION_PREVIOUS"
                hidden=""
                title="Previous"
              >
                <p>
                  Previous
                </p>
              </button>
              <ol
                aria-label="Items"
                aria-live="polite"
                aria-roledescription="carousel"
                class="ais-Carousel-list LIST"
                id="ais-Carousel-0"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM"
                >
                  <p>
                    2
                  </p>
                </li>
              </ol>
              <button
                aria-controls="ais-Carousel-0"
                aria-label="Next"
                class="ais-Carousel-navigation NAVIGATION ais-Carousel-navigation--next NAVIGATION_NEXT"
                title="Next"
              >
                <p>
                  Next
                </p>
              </button>
            </div>
          </section>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof trendingItems>[0] = {
        container,
        templates: {
          header({ items, cssClasses }) {
            return (
              <h4 className={cssClasses.title}>
                Trending items ({items.length})
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

    test('renders with a custom layout using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof trendingItems>[0] = {
        container,
        templates: {
          layout({ items }) {
            return (
              <ul>
                {items.map((item) => (
                  <li key={item.objectID}>
                    <p>{item.objectID}</p>
                  </li>
                ))}
              </ul>
            );
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = trendingItems(options);

      search.addWidgets([widget]);
      search.start();

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
            <ul>
              <li>
                <p>
                  1
                </p>
              </li>
              <li>
                <p>
                  2
                </p>
              </li>
            </ul>
          </section>
        </div>
      `);
    });

    test('renders with a carousel layout using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof trendingItems>[0] = {
        container,
        templates: {
          item(hit) {
            return <p>{hit.objectID}</p>;
          },
          layout: carousel({
            cssClasses: {
              root: 'ROOT',
              list: 'LIST',
              item: 'ITEM',
              navigation: 'NAVIGATION',
              navigationNext: 'NAVIGATION_NEXT',
              navigationPrevious: 'NAVIGATION_PREVIOUS',
            },
            templates: {
              previous() {
                return <p>Previous</p>;
              },
              next() {
                return <p>Next</p>;
              },
            },
          }),
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = trendingItems(options);

      search.addWidgets([widget]);
      search.start();

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
              class="ais-Carousel ROOT"
            >
              <button
                aria-controls="ais-Carousel-1"
                aria-label="Previous"
                class="ais-Carousel-navigation NAVIGATION ais-Carousel-navigation--previous NAVIGATION_PREVIOUS"
                hidden=""
                title="Previous"
              >
                <p>
                  Previous
                </p>
              </button>
              <ol
                aria-label="Items"
                aria-live="polite"
                aria-roledescription="carousel"
                class="ais-Carousel-list LIST"
                id="ais-Carousel-1"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM"
                >
                  <p>
                    2
                  </p>
                </li>
              </ol>
              <button
                aria-controls="ais-Carousel-1"
                aria-label="Next"
                class="ais-Carousel-navigation NAVIGATION ais-Carousel-navigation--next NAVIGATION_NEXT"
                title="Next"
              >
                <p>
                  Next
                </p>
              </button>
            </div>
          </section>
        </div>
      `);
    });
  });
});
