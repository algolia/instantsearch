/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import frequentlyBoughtTogether from '../frequently-bought-together';
import { carousel } from '../../../templates';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('frequentlyBoughtTogether', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createRecommendSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          frequentlyBoughtTogether({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/frequently-bought-together/js/"
      `);
    });

    test('adds custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof frequentlyBoughtTogether>[0] = {
        container,
        objectIDs: ['1'],
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
      const widget = frequentlyBoughtTogether(options);

      search.addWidgets([widget]);

      search.start();

      await wait(0);

      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether')
      ).toHaveClass('ROOT');
      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether-title')
      ).toHaveClass('TITLE');
      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether-container')
      ).toHaveClass('CONTAINER');
      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether-list')
      ).toHaveClass('LIST');
      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether-item')
      ).toHaveClass('ITEM');

      search
        .removeWidgets([widget])
        .addWidgets([frequentlyBoughtTogether({ ...options, limit: 0 })]);

      await wait(0);

      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether')
      ).toHaveClass('ROOT', 'EMPTY_ROOT');
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient({
        minimal: true,
      });
      const options: Parameters<typeof frequentlyBoughtTogether>[0] = {
        container,
        objectIDs: ['1'],
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = frequentlyBoughtTogether(options);

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
            class="ais-FrequentlyBoughtTogether"
          >
            <h3
              class="ais-FrequentlyBoughtTogether-title"
            >
              Frequently bought together
            </h3>
            <div
              class="ais-FrequentlyBoughtTogether-container"
            >
              <ol
                class="ais-FrequentlyBoughtTogether-list"
              >
                <li
                  class="ais-FrequentlyBoughtTogether-item"
                >
                  {
          "objectID": "1"
        }
                </li>
                <li
                  class="ais-FrequentlyBoughtTogether-item"
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

      search
        .removeWidgets([widget])
        .addWidgets([frequentlyBoughtTogether({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-FrequentlyBoughtTogether ais-FrequentlyBoughtTogether--empty"
          >
            No results
          </section>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof frequentlyBoughtTogether>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          header({ items, cssClasses }, { html }) {
            return html`<h4 class="${cssClasses.title}">
              Frequently bought together (${items.length})
            </h4>`;
          },
          item(hit, { html }) {
            return html`<p>${hit.objectID}</p>`;
          },
          empty(_, { html }) {
            return html`<p>No recommendations.</p>`;
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = frequentlyBoughtTogether(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-FrequentlyBoughtTogether"
          >
            <h4
              class="ais-FrequentlyBoughtTogether-title"
            >
              Frequently bought together (
              2
              )
            </h4>
            <div
              class="ais-FrequentlyBoughtTogether-container"
            >
              <ol
                class="ais-FrequentlyBoughtTogether-list"
              >
                <li
                  class="ais-FrequentlyBoughtTogether-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  class="ais-FrequentlyBoughtTogether-item"
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

      search.removeWidgets([widget]).addWidgets([
        frequentlyBoughtTogether({
          ...options,
          limit: 0,
        }),
      ]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-FrequentlyBoughtTogether ais-FrequentlyBoughtTogether--empty"
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
      const options: Parameters<typeof frequentlyBoughtTogether>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          layout({ items }, { html }) {
            return html`<ul>
              ${items.map((item) => html`<li><p>${item.objectID}</p></li>`)}
            </ul>`;
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = frequentlyBoughtTogether(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-FrequentlyBoughtTogether"
          >
            <h3
              class="ais-FrequentlyBoughtTogether-title"
            >
              Frequently bought together
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
      const options: Parameters<typeof frequentlyBoughtTogether>[0] = {
        container,
        objectIDs: ['1'],
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
      const widget = frequentlyBoughtTogether(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-FrequentlyBoughtTogether"
          >
            <h3
              class="ais-FrequentlyBoughtTogether-title"
            >
              Frequently bought together
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
      const options: Parameters<typeof frequentlyBoughtTogether>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          header({ items, cssClasses }) {
            return (
              <h4 className={cssClasses.title}>
                Frequently bought together ({items.length})
              </h4>
            );
          },
          item(hit) {
            return <p>{hit.objectID}</p>;
          },
          empty() {
            return <p>No recommendations.</p>;
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = frequentlyBoughtTogether(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-FrequentlyBoughtTogether"
          >
            <h4
              class="ais-FrequentlyBoughtTogether-title"
            >
              Frequently bought together (
              2
              )
            </h4>
            <div
              class="ais-FrequentlyBoughtTogether-container"
            >
              <ol
                class="ais-FrequentlyBoughtTogether-list"
              >
                <li
                  class="ais-FrequentlyBoughtTogether-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  class="ais-FrequentlyBoughtTogether-item"
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

      search.removeWidgets([widget]).addWidgets([
        frequentlyBoughtTogether({
          ...options,
          limit: 0,
        }),
      ]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-FrequentlyBoughtTogether ais-FrequentlyBoughtTogether--empty"
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
      const options: Parameters<typeof frequentlyBoughtTogether>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          layout({ items }) {
            return (
              <ul>
                {items.map((item) => (
                  <li>
                    <p>{item.objectID}</p>
                  </li>
                ))}
              </ul>
            );
          },
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = frequentlyBoughtTogether(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-FrequentlyBoughtTogether"
          >
            <h3
              class="ais-FrequentlyBoughtTogether-title"
            >
              Frequently bought together
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
      const options: Parameters<typeof frequentlyBoughtTogether>[0] = {
        container,
        objectIDs: ['1'],
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
      const widget = frequentlyBoughtTogether(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-FrequentlyBoughtTogether"
          >
            <h3
              class="ais-FrequentlyBoughtTogether-title"
            >
              Frequently bought together
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
