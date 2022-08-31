/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '../../../../test/utils/wait';
import breadcrumb from '../breadcrumb';
import {
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '../../../../test/mock/createAPIResponse';
import { connectHierarchicalMenu } from '../../../connectors';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('breadcrumb', () => {
  describe('templates', () => {
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
  });
});
