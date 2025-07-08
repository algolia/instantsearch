/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import { carousel } from '../../../templates';
import trendingFacets from '../trending-facets';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('trendingFacets', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createRecommendSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          trendingFacets({
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
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        attribute: 'attribute',
        templates: { item: (hit) => hit.value },
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
      const trendingFacetsWidget = trendingFacets(options);

      search.addWidgets([trendingFacetsWidget]);

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

      search.removeWidgets([trendingFacetsWidget]);

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
      const searchClient = createRecommendSearchClient({
        fixture: [
          { attribute: 'value1', value: 'value1' },
          { attribute: 'value2', value: 'value2' },
        ],
      });
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        attribute: 'attribute',
        templates: { item: (hit) => hit.value },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const trendingFacetsWidget = trendingFacets(options);

      search.addWidgets([trendingFacetsWidget]);

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
              Trending facets
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
                  undefined
                </li>
                <li
                  class="ais-TrendingFacets-item"
                >
                  undefined
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      search.removeWidgets([trendingFacetsWidget]);

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
      const searchClient = createRecommendSearchClient({
        fixture: [
          { facetName: 'attr', facetValue: 'value1' },
          { facetName: 'attr', facetValue: 'value2' },
        ],
      });
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        attribute: 'attribute',
        templates: {
          header({ items, cssClasses }, { html }) {
            return html`<h4 class="${cssClasses.title}">
              Trending facets (${items.length})
            </h4>`;
          },
          item(item, { html }) {
            return html`<p>${item.attribute}: ${item.value}</p>`;
          },
          empty(_, { html }) {
            return html`<p>No recommendations.</p>`;
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const trendingFacetsWidget = trendingFacets(options);

      search.addWidgets([trendingFacetsWidget]);

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
                    attr
                    : 
                    value1
                  </p>
                </li>
                <li
                  class="ais-TrendingFacets-item"
                >
                  <p>
                    attr
                    : 
                    value2
                  </p>
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      search.removeWidgets([trendingFacetsWidget]);

      search.addWidgets([trendingFacets({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets ais-TrendingFacets--empty"
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
      const searchClient = createRecommendSearchClient({
        fixture: [
          { facetName: 'attr', facetValue: 'value1' },
          { facetName: 'attr', facetValue: 'value2' },
        ],
      });
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        attribute: 'attribute',
        templates: {
          layout({ items }, { html }) {
            return html`<ul>
              ${items.map((item) => html`<li><p>${item.objectID}</p></li>`)}
            </ul>`;
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
            <h3
              class="ais-TrendingFacets-title"
            >
              Trending facets
            </h3>
            <ul>
              <li>
                <p>
                  attr:value1
                </p>
              </li>
              <li>
                <p>
                  attr:value2
                </p>
              </li>
            </ul>
          </section>
        </div>
      `);
    });

    test('renders with a carousel layout without options using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient({
        fixture: [
          { facetName: 'attr', facetValue: 'value1' },
          { facetName: 'attr', facetValue: 'value2' },
        ],
      });
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        attribute: 'attribute',
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
      const widget = trendingFacets(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets"
          >
            <h3
              class="ais-TrendingFacets-title"
            >
              Trending facets
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
                class="ais-Carousel-list LIST ais-TrendingFacets-list"
                id="ais-Carousel-0"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-TrendingFacets-item"
                >
                  <p>
                    attr:value1
                  </p>
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-TrendingFacets-item"
                >
                  <p>
                    attr:value2
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

    test('renders with a carousel layout with options using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient({
        fixture: [
          { facetName: 'attr', facetValue: 'value1' },
          { facetName: 'attr', facetValue: 'value2' },
        ],
      });
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        attribute: 'attribute',
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
      const widget = trendingFacets(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets"
          >
            <h3
              class="ais-TrendingFacets-title"
            >
              Trending facets
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
                class="ais-Carousel-list LIST ais-TrendingFacets-list"
                id="ais-Carousel-1"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-TrendingFacets-item"
                >
                  <p>
                    attr:value1
                  </p>
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-TrendingFacets-item"
                >
                  <p>
                    attr:value2
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

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient({
        fixture: [
          { facetName: 'attr', facetValue: 'value1' },
          { facetName: 'attr', facetValue: 'value2' },
        ],
      });
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        attribute: 'attribute',
        templates: {
          header({ items, cssClasses }) {
            return (
              <h4 className={cssClasses.title}>
                Trending facets ({items.length})
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
      const trendingFacetsWidget = trendingFacets(options);

      search.addWidgets([trendingFacetsWidget]);

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
                    attr:value1
                  </p>
                </li>
                <li
                  class="ais-TrendingFacets-item"
                >
                  <p>
                    attr:value2
                  </p>
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      search.removeWidgets([trendingFacetsWidget]);

      search.addWidgets([trendingFacets({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets ais-TrendingFacets--empty"
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
      const searchClient = createRecommendSearchClient({
        fixture: [
          { objectID: '1', value: '1' },
          { objectID: '2', value: '2' },
        ],
      });
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        attribute: 'attribute',
        templates: {
          layout({ items }) {
            return (
              <ul>
                {items.map((item) => (
                  <li key={item.value}>
                    <p>{item.value}</p>
                  </li>
                ))}
              </ul>
            );
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
            <h3
              class="ais-TrendingFacets-title"
            >
              Trending facets
            </h3>
            <ul>
              <li>
                <p />
              </li>
              <li>
                <p />
              </li>
            </ul>
          </section>
        </div>
      `);
    });

    test('renders with a carousel layout without options using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient({
        fixture: [
          { objectID: '1', value: '1' },
          { objectID: '2', value: '2' },
        ],
      });
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        attribute: 'attribute',
        templates: {
          item(hit) {
            return <p>{hit.value}</p>;
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
      const widget = trendingFacets(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets"
          >
            <h3
              class="ais-TrendingFacets-title"
            >
              Trending facets
            </h3>
            <div
              class="ais-Carousel ROOT"
            >
              <button
                aria-controls="ais-Carousel-2"
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
                class="ais-Carousel-list LIST ais-TrendingFacets-list"
                id="ais-Carousel-2"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-TrendingFacets-item"
                >
                  <p />
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-TrendingFacets-item"
                >
                  <p />
                </li>
              </ol>
              <button
                aria-controls="ais-Carousel-2"
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

    test('renders with a carousel layout with options using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient({
        fixture: [
          { facetName: 'attr', facetValue: 'value1' },
          { facetName: 'attr', facetValue: 'value2' },
        ],
      });
      const options: Parameters<typeof trendingFacets>[0] = {
        container,
        attribute: 'attribute',
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
      const widget = trendingFacets(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-TrendingFacets"
          >
            <h3
              class="ais-TrendingFacets-title"
            >
              Trending facets
            </h3>
            <div
              class="ais-Carousel ROOT"
            >
              <button
                aria-controls="ais-Carousel-3"
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
                class="ais-Carousel-list LIST ais-TrendingFacets-list"
                id="ais-Carousel-3"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-TrendingFacets-item"
                >
                  <p>
                    attr:value1
                  </p>
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-TrendingFacets-item"
                >
                  <p>
                    attr:value2
                  </p>
                </li>
              </ol>
              <button
                aria-controls="ais-Carousel-3"
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
