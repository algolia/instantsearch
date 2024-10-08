/**
 * @jest-environment jsdom
 */
/** @jsx h */
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import { connectHierarchicalMenu } from '../../../connectors';
import instantsearch from '../../../index.es';
import breadcrumb from '../breadcrumb';

const hierarchicalFacets = {
  'hierarchicalCategories.lvl0': {
    'Cameras & Camcorders': 1369,
  },
  'hierarchicalCategories.lvl1': {
    'Cameras & Camcorders > Digital Cameras': 170,
  },
};
const attributes = Object.keys(hierarchicalFacets);
const virtualHierarchicalMenu = connectHierarchicalMenu(() => null);

describe('breadcrumb', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createMockedSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          breadcrumb({
            // @ts-expect-error
            container: undefined,
            attributes,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/breadcrumb/js/"
`);
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        },
      });

      search.addWidgets([
        virtualHierarchicalMenu({ attributes }),
        breadcrumb({ container, attributes }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-Breadcrumb"
  >
    <ul
      class="ais-Breadcrumb-list"
    >
      <li
        class="ais-Breadcrumb-item"
      >
        <a
          class="ais-Breadcrumb-link"
          href="#"
        >
          Home
        </a>
      </li>
      <li
        class="ais-Breadcrumb-item"
      >
        <span
          aria-hidden="true"
          class="ais-Breadcrumb-separator"
        >
          &gt;
        </span>
        <a
          class="ais-Breadcrumb-link"
          href="#"
        >
          Cameras & Camcorders
        </a>
      </li>
      <li
        class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
      >
        <span
          aria-hidden="true"
          class="ais-Breadcrumb-separator"
        >
          &gt;
        </span>
        Digital Cameras
      </li>
    </ul>
  </div>
</div>
`);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        },
      });

      search.addWidgets([
        virtualHierarchicalMenu({ attributes }),
        breadcrumb({
          container,
          attributes,
          templates: {
            home(_, { html }) {
              return html`<span>Home</span>`;
            },
            separator(_, { html }) {
              return html`<span>/</span>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-Breadcrumb"
  >
    <ul
      class="ais-Breadcrumb-list"
    >
      <li
        class="ais-Breadcrumb-item"
      >
        <a
          class="ais-Breadcrumb-link"
          href="#"
        >
          <span>
            Home
          </span>
        </a>
      </li>
      <li
        class="ais-Breadcrumb-item"
      >
        <span
          aria-hidden="true"
          class="ais-Breadcrumb-separator"
        >
          <span>
            /
          </span>
        </span>
        <a
          class="ais-Breadcrumb-link"
          href="#"
        >
          Cameras & Camcorders
        </a>
      </li>
      <li
        class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
      >
        <span
          aria-hidden="true"
          class="ais-Breadcrumb-separator"
        >
          <span>
            /
          </span>
        </span>
        Digital Cameras
      </li>
    </ul>
  </div>
</div>
`);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        },
      });

      search.addWidgets([
        virtualHierarchicalMenu({ attributes }),
        breadcrumb({
          container,
          attributes,
          templates: {
            home() {
              return <span>Home</span>;
            },
            separator() {
              return <span>/</span>;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-Breadcrumb"
  >
    <ul
      class="ais-Breadcrumb-list"
    >
      <li
        class="ais-Breadcrumb-item"
      >
        <a
          class="ais-Breadcrumb-link"
          href="#"
        >
          <span>
            Home
          </span>
        </a>
      </li>
      <li
        class="ais-Breadcrumb-item"
      >
        <span
          aria-hidden="true"
          class="ais-Breadcrumb-separator"
        >
          <span>
            /
          </span>
        </span>
        <a
          class="ais-Breadcrumb-link"
          href="#"
        >
          Cameras & Camcorders
        </a>
      </li>
      <li
        class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
      >
        <span
          aria-hidden="true"
          class="ais-Breadcrumb-separator"
        >
          <span>
            /
          </span>
        </span>
        Digital Cameras
      </li>
    </ul>
  </div>
</div>
`);
    });
  });
});

function createMockedSearchClient() {
  return createSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() =>
            createSingleSearchResponse({
              facets: hierarchicalFacets,
            })
          )
        )
      )
    ),
  });
}
