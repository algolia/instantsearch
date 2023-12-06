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
import { fireEvent, within } from '@testing-library/dom';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import { createInsightsMiddleware } from '../../../middlewares';
import hierarchicalMenu from '../hierarchical-menu';

beforeEach(() => {
  document.body.innerHTML = '';
});

const facets = {
  'categories.lvl0': {
    'Cameras & Camcorders': 1369,
    'Video Games': 505,
    'Wearable Technology': 271,
  },
  'categories.lvl1': {
    'Cameras & Camcorders > Digital Cameras': 170,
    'Cameras & Camcorders > Memory Cards': 113,
  },
};

const attributes = Object.keys(facets);

describe('hierarchicalMenu', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createMockedSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          hierarchicalMenu({
            // @ts-expect-error
            container: undefined,
            attributes,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hierarchical-menu/js/"
`);
    });

    test('add custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        hierarchicalMenu({
          container,
          attributes,
          cssClasses: {
            root: 'ROOT',
            noRefinementRoot: 'NO_REFINEMENT_ROOT',
            list: 'LIST',
            childList: 'CHILD_LIST',
            item: 'ITEM',
            selectedItem: 'SELECTED_ITEM',
            parentItem: 'PARENT_ITEM',
            link: 'LINK',
            selectedItemLink: 'SELECTED_ITEM_LINK',
            label: 'LABEL',
            count: 'COUNT',
            showMore: 'SHOW_MORE',
            disabledShowMore: 'DISABLED_SHOW_MORE',
          },
        }),
      ]);

      search.start();

      await wait(0);

      const root = container.firstChild;

      expect(root).toHaveClass('ROOT');
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
            class="ais-HierarchicalMenu-link ais-HierarchicalMenu-link--selected"
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
  });

  describe('insights', () => {
    test('sends "click" event when clicking on a facet', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.use(insights);

      search.addWidgets([
        hierarchicalMenu({
          container,
          attributes: ['categories.lvl0', 'categories.lvl1'],
        }),
      ]);

      search.start();

      await wait(0);

      fireEvent.click(
        within(container).getByRole('link', {
          name: /cameras & camcorders [\d,]+/i,
        })
      );

      expect(onEvent).toHaveBeenLastCalledWith(
        {
          attribute: 'categories.lvl0',
          eventType: 'click',
          eventModifier: 'internal',
          insightsMethod: 'clickedFilters',
          payload: {
            eventName: 'Filter Applied',
            filters: ['categories.lvl0:Cameras & Camcorders'],
            index: 'indexName',
          },
          widgetType: 'ais.hierarchicalMenu',
        },
        expect.any(Function)
      );

      await wait(0);

      fireEvent.click(
        within(container).getByRole('link', {
          name: /digital cameras [\d,]+/i,
        })
      );

      expect(onEvent).toHaveBeenLastCalledWith(
        {
          attribute: 'categories.lvl1',
          eventType: 'click',
          eventModifier: 'internal',
          insightsMethod: 'clickedFilters',
          payload: {
            eventName: 'Filter Applied',
            filters: ['categories.lvl1:Cameras & Camcorders > Digital Cameras'],
            index: 'indexName',
          },
          widgetType: 'ais.hierarchicalMenu',
        },
        expect.any(Function)
      );
    });
  });

  function createInsightsMiddlewareWithOnEvent() {
    const onEvent = jest.fn();
    const insights = createInsightsMiddleware({
      insightsClient: null,
      onEvent,
    });

    return { onEvent, insights };
  }
});

function createMockedSearchClient() {
  const search = jest.fn((requests) =>
    Promise.resolve(
      createMultiSearchResponse(
        ...requests.map(() => createSingleSearchResponse({ facets }))
      )
    )
  );

  return createSearchClient({ search });
}
