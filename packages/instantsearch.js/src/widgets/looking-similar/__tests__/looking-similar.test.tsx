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
import { h } from 'preact';

import instantsearch from '../../../index.es';
import lookingSimilar from '../looking-similar';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('lookingSimilar', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          lookingSimilar({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/looking-similar/js/"
      `);
    });

    test('adds custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
      const options: Parameters<typeof lookingSimilar>[0] = {
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
      const widget = lookingSimilar(options);

      search.addWidgets([widget]);

      search.start();

      await wait(0);

      expect(container.querySelector('.ais-LookingSimilar')).toHaveClass(
        'ROOT'
      );
      expect(container.querySelector('.ais-LookingSimilar-title')).toHaveClass(
        'TITLE'
      );
      expect(
        container.querySelector('.ais-LookingSimilar-container')
      ).toHaveClass('CONTAINER');
      expect(container.querySelector('.ais-LookingSimilar-list')).toHaveClass(
        'LIST'
      );
      expect(container.querySelector('.ais-LookingSimilar-item')).toHaveClass(
        'ITEM'
      );

      search
        .removeWidgets([widget])
        .addWidgets([lookingSimilar({ ...options, maxRecommendations: 0 })]);

      await wait(0);

      expect(container.querySelector('.ais-LookingSimilar')).toHaveClass(
        'ROOT',
        'EMPTY_ROOT'
      );
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
      const options: Parameters<typeof lookingSimilar>[0] = {
        container,
        objectIDs: ['1'],
      };

      const search = instantsearch({ indexName: 'indexName', searchClient });
      const widget = lookingSimilar(options);

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
            class="ais-LookingSimilar"
          >
            <h3
              class="ais-LookingSimilar-title"
            >
              Looking similar
            </h3>
            <div
              class="ais-LookingSimilar-container"
            >
              <ol
                class="ais-LookingSimilar-list"
              >
                <li
                  class="ais-LookingSimilar-item"
                >
                  {
          "objectID": "1"
        }
                </li>
                <li
                  class="ais-LookingSimilar-item"
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
        .addWidgets([lookingSimilar({ ...options, maxRecommendations: 0 })]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-LookingSimilar ais-LookingSimilar--empty"
          >
            No results
          </section>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
      const options: Parameters<typeof lookingSimilar>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          header({ recommendations, cssClasses }, { html }) {
            return html`<h4 class="${cssClasses.title}">
              Looking similar (${recommendations.length})
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
      const widget = lookingSimilar(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-LookingSimilar"
          >
            <h4
              class="ais-LookingSimilar-title"
            >
              Looking similar (
              2
              )
            </h4>
            <div
              class="ais-LookingSimilar-container"
            >
              <ol
                class="ais-LookingSimilar-list"
              >
                <li
                  class="ais-LookingSimilar-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  class="ais-LookingSimilar-item"
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
        lookingSimilar({
          ...options,
          maxRecommendations: 0,
        }),
      ]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-LookingSimilar ais-LookingSimilar--empty"
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
      const options: Parameters<typeof lookingSimilar>[0] = {
        container,
        objectIDs: ['1'],
        templates: {
          header({ recommendations, cssClasses }) {
            return (
              <h4 className={cssClasses.title}>
                Looking similar ({recommendations.length})
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
      const widget = lookingSimilar(options);

      search.addWidgets([widget]);
      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-LookingSimilar"
          >
            <h4
              class="ais-LookingSimilar-title"
            >
              Looking similar (
              2
              )
            </h4>
            <div
              class="ais-LookingSimilar-container"
            >
              <ol
                class="ais-LookingSimilar-list"
              >
                <li
                  class="ais-LookingSimilar-item"
                >
                  <p>
                    1
                  </p>
                </li>
                <li
                  class="ais-LookingSimilar-item"
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
        lookingSimilar({
          ...options,
          maxRecommendations: 0,
        }),
      ]);

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-LookingSimilar ais-LookingSimilar--empty"
          >
            <p>
              No recommendations.
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
