/**
 * @jest-environment jsdom
 */
/** @jsx h */
import {
  createRecommendResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { Fragment, h } from 'preact';

import instantsearch from '../../../index.es';
import frequentlyBoughtTogether from '../frequently-bought-together';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('frequentlyBoughtTogether', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

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
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        frequentlyBoughtTogether({
          container,
          objectIDs: ['objectID'],
          cssClasses: {
            root: 'ROOT',
            title: 'TITLE',
            container: 'CONTAINER',
            list: 'LIST',
            item: 'ITEM',
          },
          templates: {
            header: 'Frequently bought together',
          },
        }),
      ]);

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
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
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
        .addWidgets([
          frequentlyBoughtTogether({ ...options, maxRecommendations: 0 }),
        ]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section>
            No results
          </section>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
      const options: Parameters<typeof frequentlyBoughtTogether>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          header({ recommendations }, { html }) {
            return html`Frequently bought with (${recommendations.length})`;
          },
          item(hit, { html }) {
            return html`<p>${hit.objectID}</p>`;
          },
          empty(_, { html }) {
            return html`<p>No recommendations</p>`;
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
               Frequently bought with (
              2
              )
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
          maxRecommendations: 0,
        }),
      ]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section>
            <p>
              No recommendations
            </p>
          </section>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
      const options: Parameters<typeof frequentlyBoughtTogether>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          header({ recommendations }) {
            return (
              <Fragment>
                Frequently bought with ({recommendations.length})
              </Fragment>
            );
          },
          item(hit) {
            return <p>{hit.objectID}</p>;
          },
          empty() {
            return <p>No recommendations</p>;
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
              Frequently bought with (
              2
              )
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
          maxRecommendations: 0,
        }),
      ]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section>
            <p>
              No recommendations
            </p>
          </section>
        </div>
      `);
    });
  });

  function createMockedSearchClient() {
    return createSearchClient({
      getRecommendations: jest.fn((requests) =>
        Promise.resolve(
          createRecommendResponse(
            // @ts-ignore
            // `request` will be implicitly typed as any in type-check:v3
            // since `getRecommendations` is not available there
            requests.map((request) => {
              return createSingleSearchResponse({
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
});
