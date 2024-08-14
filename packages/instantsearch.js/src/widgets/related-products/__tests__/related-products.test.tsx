/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import { carousel } from '../../../templates';
import relatedProducts from '../related-products';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('relatedProducts', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createRecommendSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          relatedProducts({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/related-products/js/"
      `);
    });

    test('adds custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof relatedProducts>[0] = {
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
      const relatedProductsWidget = relatedProducts(options);

      search.addWidgets([relatedProductsWidget]);

      search.start();

      await wait(0);

      expect(container.querySelector('.ais-RelatedProducts')).toHaveClass(
        'ROOT'
      );
      expect(container.querySelector('.ais-RelatedProducts-title')).toHaveClass(
        'TITLE'
      );
      expect(
        container.querySelector('.ais-RelatedProducts-container')
      ).toHaveClass('CONTAINER');
      expect(container.querySelector('.ais-RelatedProducts-list')).toHaveClass(
        'LIST'
      );
      expect(container.querySelector('.ais-RelatedProducts-item')).toHaveClass(
        'ITEM'
      );

      search.removeWidgets([relatedProductsWidget]);

      search.addWidgets([relatedProducts({ ...options, limit: 0 })]);

      await wait(0);

      expect(container.querySelector('.ais-RelatedProducts')).toHaveClass(
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
      const options: Parameters<typeof relatedProducts>[0] = {
        container,
        objectIDs: ['1'],
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const relatedProductsWidget = relatedProducts(options);

      search.addWidgets([relatedProductsWidget]);

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
            class="ais-RelatedProducts"
          >
            <h3
              class="ais-RelatedProducts-title"
            >
              Related products
            </h3>
            <div
              class="ais-RelatedProducts-container"
            >
              <ol
                class="ais-RelatedProducts-list"
              >
                <li
                  class="ais-RelatedProducts-item"
                >
                  {
          "objectID": "1"
        }
                </li>
                <li
                  class="ais-RelatedProducts-item"
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

      search.removeWidgets([relatedProductsWidget]);

      search.addWidgets([relatedProducts({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts ais-RelatedProducts--empty"
          >
            No results
          </section>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof relatedProducts>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          header({ items, cssClasses }, { html }) {
            return html`<h4 class="${cssClasses.title}">
              Related products (${items.length})
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
      const relatedProductsWidget = relatedProducts(options);

      search.addWidgets([relatedProductsWidget]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts"
          >
            <h4
              class="ais-RelatedProducts-title"
            >
              Related products (
              2
              )
            </h4>
            <div
              class="ais-RelatedProducts-container"
            >
              <ol
                class="ais-RelatedProducts-list"
              >
                <li
                  class="ais-RelatedProducts-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  class="ais-RelatedProducts-item"
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

      search.removeWidgets([relatedProductsWidget]);

      search.addWidgets([relatedProducts({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts ais-RelatedProducts--empty"
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
      const options: Parameters<typeof relatedProducts>[0] = {
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
      const widget = relatedProducts(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts"
          >
            <h3
              class="ais-RelatedProducts-title"
            >
              Related products
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

    test('renders with a carousel layout without options using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof relatedProducts>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          item(hit, { html }) {
            return html`<p>${hit.objectID}</p>`;
          },
          layout: carousel(),
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = relatedProducts(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts"
          >
            <h3
              class="ais-RelatedProducts-title"
            >
              Related products
            </h3>
            <div
              class="ais-Carousel"
            >
              <button
                aria-controls="ais-Carousel-0"
                aria-label="Previous"
                class="ais-Carousel-navigation ais-Carousel-navigation--previous"
                hidden=""
                title="Previous"
              >
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 8 16"
                  width="8"
                >
                  <path
                    clipRule="evenodd"
                    d="M7.13809 0.744078C7.39844 1.06951 7.39844 1.59715 7.13809 1.92259L2.27616 8L7.13809 14.0774C7.39844 14.4028 7.39844 14.9305 7.13809 15.2559C6.87774 15.5814 6.45563 15.5814 6.19528 15.2559L0.861949 8.58926C0.6016 8.26382 0.6016 7.73618 0.861949 7.41074L6.19528 0.744078C6.45563 0.418641 6.87774 0.418641 7.13809 0.744078Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </button>
              <ol
                aria-label="Items"
                aria-live="polite"
                aria-roledescription="carousel"
                class="ais-Carousel-list ais-RelatedProducts-list"
                id="ais-Carousel-0"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ais-RelatedProducts-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ais-RelatedProducts-item"
                >
                  <p>
                    2
                  </p>
                </li>
              </ol>
              <button
                aria-controls="ais-Carousel-0"
                aria-label="Next"
                class="ais-Carousel-navigation ais-Carousel-navigation--next"
                title="Next"
              >
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 8 16"
                  width="8"
                >
                  <path
                    clipRule="evenodd"
                    d="M0.861908 15.2559C0.601559 14.9305 0.601559 14.4028 0.861908 14.0774L5.72384 8L0.861908 1.92259C0.601559 1.59715 0.601559 1.06952 0.861908 0.744079C1.12226 0.418642 1.54437 0.418642 1.80472 0.744079L7.13805 7.41074C7.3984 7.73618 7.3984 8.26382 7.13805 8.58926L1.80472 15.2559C1.54437 15.5814 1.12226 15.5814 0.861908 15.2559Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </section>
        </div>
      `);
    });

    test('renders with a carousel layout with options using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof relatedProducts>[0] = {
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
      const widget = relatedProducts(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts"
          >
            <h3
              class="ais-RelatedProducts-title"
            >
              Related products
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
                class="ais-Carousel-list LIST ais-RelatedProducts-list"
                id="ais-Carousel-1"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-RelatedProducts-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-RelatedProducts-item"
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

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof relatedProducts>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          header({ items, cssClasses }) {
            return (
              <h4 className={cssClasses.title}>
                Related products ({items.length})
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
      const relatedProductsWidget = relatedProducts(options);

      search.addWidgets([relatedProductsWidget]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts"
          >
            <h4
              class="ais-RelatedProducts-title"
            >
              Related products (
              2
              )
            </h4>
            <div
              class="ais-RelatedProducts-container"
            >
              <ol
                class="ais-RelatedProducts-list"
              >
                <li
                  class="ais-RelatedProducts-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  class="ais-RelatedProducts-item"
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

      search.removeWidgets([relatedProductsWidget]);

      search.addWidgets([relatedProducts({ ...options, limit: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts ais-RelatedProducts--empty"
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
      const options: Parameters<typeof relatedProducts>[0] = {
        container,
        objectIDs: ['1'],
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
      const widget = relatedProducts(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts"
          >
            <h3
              class="ais-RelatedProducts-title"
            >
              Related products
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

    test('renders with a carousel layout without options using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof relatedProducts>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          item(hit) {
            return <p>{hit.objectID}</p>;
          },
          layout: carousel(),
        },
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = relatedProducts(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts"
          >
            <h3
              class="ais-RelatedProducts-title"
            >
              Related products
            </h3>
            <div
              class="ais-Carousel"
            >
              <button
                aria-controls="ais-Carousel-2"
                aria-label="Previous"
                class="ais-Carousel-navigation ais-Carousel-navigation--previous"
                hidden=""
                title="Previous"
              >
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 8 16"
                  width="8"
                >
                  <path
                    clipRule="evenodd"
                    d="M7.13809 0.744078C7.39844 1.06951 7.39844 1.59715 7.13809 1.92259L2.27616 8L7.13809 14.0774C7.39844 14.4028 7.39844 14.9305 7.13809 15.2559C6.87774 15.5814 6.45563 15.5814 6.19528 15.2559L0.861949 8.58926C0.6016 8.26382 0.6016 7.73618 0.861949 7.41074L6.19528 0.744078C6.45563 0.418641 6.87774 0.418641 7.13809 0.744078Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </button>
              <ol
                aria-label="Items"
                aria-live="polite"
                aria-roledescription="carousel"
                class="ais-Carousel-list ais-RelatedProducts-list"
                id="ais-Carousel-2"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ais-RelatedProducts-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ais-RelatedProducts-item"
                >
                  <p>
                    2
                  </p>
                </li>
              </ol>
              <button
                aria-controls="ais-Carousel-2"
                aria-label="Next"
                class="ais-Carousel-navigation ais-Carousel-navigation--next"
                title="Next"
              >
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 8 16"
                  width="8"
                >
                  <path
                    clipRule="evenodd"
                    d="M0.861908 15.2559C0.601559 14.9305 0.601559 14.4028 0.861908 14.0774L5.72384 8L0.861908 1.92259C0.601559 1.59715 0.601559 1.06952 0.861908 0.744079C1.12226 0.418642 1.54437 0.418642 1.80472 0.744079L7.13805 7.41074C7.3984 7.73618 7.3984 8.26382 7.13805 8.58926L1.80472 15.2559C1.54437 15.5814 1.12226 15.5814 0.861908 15.2559Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </section>
        </div>
      `);
    });

    test('renders with a carousel layout with options using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createRecommendSearchClient();
      const options: Parameters<typeof relatedProducts>[0] = {
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
      const widget = relatedProducts(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-RelatedProducts"
          >
            <h3
              class="ais-RelatedProducts-title"
            >
              Related products
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
                class="ais-Carousel-list LIST ais-RelatedProducts-list"
                id="ais-Carousel-3"
                tabindex="0"
              >
                <li
                  aria-label="1 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-RelatedProducts-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  aria-label="2 of 2"
                  aria-roledescription="slide"
                  class="ais-Carousel-item ITEM ais-RelatedProducts-item"
                >
                  <p>
                    2
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
