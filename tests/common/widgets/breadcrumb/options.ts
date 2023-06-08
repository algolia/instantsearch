import {
  createAlgoliaSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import type { BreadcrumbSetup } from '.';
import type { Act } from '../../common';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { wait } from '@instantsearch/testutils';

const hierarchicalFacets = {
  'hierarchicalCategories.lvl0': {
    'Cameras & Camcorders': 1369,
  },
  'hierarchicalCategories.lvl1': {
    'Cameras & Camcorders > Digital Cameras': 170,
  },
};

const hierarchicalAttributes = Object.keys(hierarchicalFacets);

const searchClient = createAlgoliaSearchClient({
  search: jest.fn((requests) => {
    return Promise.resolve(
      createMultiSearchResponse(
        ...requests.map(() =>
          createSingleSearchResponse({
            facets: hierarchicalFacets,
          })
        )
      )
    );
  }),
});

const normalizeFn = (html: string) =>
  html
    // Vue renders a useless extra space between list item elements
    .replace(/<\/li> <li/g, '</li><li')
    // Vue renders a useless extra space between last list item element and closing list tag
    .replace(/<\/li> <\/ul>/g, '</li></ul>');

export function createOptionsTests(setup: BreadcrumbSetup, act: Act) {
  describe('options', () => {
    beforeEach(() => {
      searchClient.search.mockClear();
    });

    test('renders with required props', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { attributes: hierarchicalAttributes },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-Breadcrumb')
      ).toMatchNormalizedInlineSnapshot(
        normalizeFn,
        `
        <div
          class="ais-Breadcrumb ais-Breadcrumb--noRefinement"
        >
          <ul
            class="ais-Breadcrumb-list"
          >
            <li
              class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
            >
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Home
              </a>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('renders with initial refinements', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              hierarchicalMenu: {
                'hierarchicalCategories.lvl0': [
                  'Cameras & Camcorders > Digital Cameras',
                ],
              },
            },
          },
          searchClient,
        },
        widgetParams: { attributes: hierarchicalAttributes },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-Breadcrumb')
      ).toMatchNormalizedInlineSnapshot(
        normalizeFn,
        `
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
      `
      );
    });

    test('transforms the items', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              hierarchicalMenu: {
                'hierarchicalCategories.lvl0': [
                  'Cameras & Camcorders > Digital Cameras',
                ],
              },
            },
          },
          searchClient,
        },
        widgetParams: {
          attributes: hierarchicalAttributes,
          transformItems: (items) =>
            items.map((item) => ({ ...item, label: item.label.toUpperCase() })),
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        [...document.querySelectorAll('.ais-Breadcrumb-item')].map(
          (item) => item.textContent
        )
      ).toMatchInlineSnapshot(`
        [
          "Home",
          ">CAMERAS & CAMCORDERS",
          ">DIGITAL CAMERAS",
        ]
      `);
    });

    test('navigates to a parent category', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              hierarchicalMenu: {
                'hierarchicalCategories.lvl0': [
                  'Cameras & Camcorders > Digital Cameras',
                ],
              },
            },
          },
          searchClient,
        },
        widgetParams: { attributes: hierarchicalAttributes },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-Breadcrumb')
      ).toMatchNormalizedInlineSnapshot(
        normalizeFn,
        `
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
      `
      );

      await act(async () => {
        userEvent.click(screen.getAllByText('Cameras & Camcorders')[0]);

        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              facetFilters: [
                ['hierarchicalCategories.lvl0:Cameras & Camcorders'],
              ],
            }),
          }),
        ])
      );
    });
  });
}
