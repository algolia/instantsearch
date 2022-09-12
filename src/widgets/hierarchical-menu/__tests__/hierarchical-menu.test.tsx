/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '../../../../test/utils/wait';
import hierarchicalMenu from '../hierarchical-menu';
import {
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '../../../../test/mock/createAPIResponse';
import { fireEvent, within } from '@testing-library/dom';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('refinementList', () => {
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
              'categories.lvl0': ['Video Games'],
            },
          },
        },
      });

      search.addWidgets([
        hierarchicalMenu({
          container,
          attributes: ['categories.lvl0', 'categories.lvl1'],
          showMore: true,
          limit: 2,
        }),
      ]);

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
  <div
    class="ais-HierarchicalMenu"
  >
    <ul
      class="ais-HierarchicalMenu-list"
    >
      <li
        class="ais-HierarchicalMenu-item"
      >
        <div>
          <a
            class="ais-HierarchicalMenu-link"
            href="#"
          >
            <span
              class="ais-HierarchicalMenu-label"
            >
              Cameras & Camcorders
            </span>
            <span
              class="ais-HierarchicalMenu-count"
            >
              1,369
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--selected"
      >
        <div>
          <a
            class="ais-HierarchicalMenu-link"
            href="#"
          >
            <span
              class="ais-HierarchicalMenu-label"
            >
              Video Games
            </span>
            <span
              class="ais-HierarchicalMenu-count"
            >
              505
            </span>
          </a>
        </div>
      </li>
    </ul>
    <button
      class="ais-HierarchicalMenu-showMore"
    >
      Show more
    </button>
  </div>
</div>
`);

      const showMoreButton = within(container).getByRole('button');

      fireEvent.click(showMoreButton);

      expect(showMoreButton).toHaveTextContent('Show less');
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
              'categories.lvl0': ['Video Games'],
            },
          },
        },
      });

      search.addWidgets([
        hierarchicalMenu({
          container,
          attributes: ['categories.lvl0', 'categories.lvl1'],
          showMore: true,
          limit: 2,
          templates: {
            item({ label, count, isRefined, url }, { html }) {
              return html`<a
                href="${url}"
                style="font-weight: ${isRefined ? 'bold' : 'normal'}"
              >
                <span>${label} (${count})</span>
              </a>`;
            },
            showMoreText(data) {
              return data.isShowingMore ? 'Show less' : 'Show more';
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-HierarchicalMenu"
  >
    <ul
      class="ais-HierarchicalMenu-list"
    >
      <li
        class="ais-HierarchicalMenu-item"
      >
        <div>
          <a
            href="#"
            style="font-weight: normal;"
          >
            <span>
              Cameras & Camcorders
               (
              1369
              )
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--selected"
      >
        <div>
          <a
            href="#"
            style="font-weight: bold;"
          >
            <span>
              Video Games
               (
              505
              )
            </span>
          </a>
        </div>
      </li>
    </ul>
    <button
      class="ais-HierarchicalMenu-showMore"
    >
      Show more
    </button>
  </div>
</div>
`);

      const showMoreButton = within(container).getByRole('button');

      fireEvent.click(showMoreButton);

      expect(showMoreButton).toHaveTextContent('Show less');
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
              'categories.lvl0': ['Video Games'],
            },
          },
        },
      });

      search.addWidgets([
        hierarchicalMenu({
          container,
          attributes: ['categories.lvl0', 'categories.lvl1'],
          showMore: true,
          limit: 2,
          templates: {
            item({ label, count, isRefined, url }) {
              return (
                <a
                  href={url}
                  style={{ fontWeight: isRefined ? 'bold' : 'normal' }}
                >
                  <span>
                    {label} ({count})
                  </span>
                </a>
              );
            },
            showMoreText(data) {
              return data.isShowingMore ? 'Show less' : 'Show more';
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-HierarchicalMenu"
  >
    <ul
      class="ais-HierarchicalMenu-list"
    >
      <li
        class="ais-HierarchicalMenu-item"
      >
        <div>
          <a
            href="#"
            style="font-weight: normal;"
          >
            <span>
              Cameras & Camcorders
               (
              1369
              )
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--selected"
      >
        <div>
          <a
            href="#"
            style="font-weight: bold;"
          >
            <span>
              Video Games
               (
              505
              )
            </span>
          </a>
        </div>
      </li>
    </ul>
    <button
      class="ais-HierarchicalMenu-showMore"
    >
      Show more
    </button>
  </div>
</div>
`);

      const showMoreButton = within(container).getByRole('button');

      fireEvent.click(showMoreButton);

      expect(showMoreButton).toHaveTextContent('Show less');
    });

    function createMockedSearchClient() {
      const search = jest.fn((requests) =>
        Promise.resolve(
          createMultiSearchResponse(
            ...requests.map(() =>
              createSingleSearchResponse({
                facets: {
                  'categories.lvl0': {
                    'Cameras & Camcorders': 1369,
                    'Video Games': 505,
                    'Wearable Technology': 271,
                  },
                  'categories.lvl1': {
                    'Cameras & Camcorders > Digital Cameras': 170,
                    'Cameras & Camcorders > Memory Cards': 113,
                  },
                },
              })
            )
          )
        )
      );

      return createSearchClient({ search });
    }
  });
});
