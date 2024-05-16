/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
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

      search.addWidgets([
        relatedProducts({ ...options, maxRecommendations: 0 }),
      ]);

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

      search.addWidgets([
        relatedProducts({ ...options, maxRecommendations: 0 }),
      ]);

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

      search.addWidgets([
        relatedProducts({ ...options, maxRecommendations: 0 }),
      ]);

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

      search.addWidgets([
        relatedProducts({ ...options, maxRecommendations: 0 }),
      ]);

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
  });
});
