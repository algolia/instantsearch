import {
  createAlgoliaSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { MenuWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function normalizeSnapshot(html: string) {
  // InstantSearch.js <Template> adds a div wrapper around menu items
  // @MAJOR: Remove this once <Template> stops defaulting to div root tags
  return commonNormalizeSnapshot(html).replace(
    /<div>\s*(<a class="ais-Menu-link"[\s\S]*?<\/a>)\s*<\/div>/g,
    '$1'
  );
}

export function createOptionsTests(
  setup: MenuWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    const searchClient = createAlgoliaSearchClient({
      search: jest.fn((requests) => {
        return Promise.resolve(
          createMultiSearchResponse(
            ...requests.map(() =>
              createSingleSearchResponse({
                facets: {
                  brand: {
                    'Insignia™': 746,
                    Samsung: 633,
                    Metra: 591,
                    HP: 530,
                  },
                },
                renderingContent: {
                  facetOrdering: {
                    values: {
                      brand: {
                        sortRemainingBy: 'count',
                      },
                    },
                  },
                },
              })
            )
          )
        );
      }),
    });

    beforeEach(() => {
      searchClient.search.mockClear();
    });

    test('renders with props', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'brand',
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(4);
      expect(
        document.querySelector('.ais-Menu')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-Menu"
        >
          <ul
            class="ais-Menu-list"
          >
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Insignia™
                </span>
                <span
                  class="ais-Menu-count"
                >
                  746
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Samsung
                </span>
                <span
                  class="ais-Menu-count"
                >
                  633
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Metra
                </span>
                <span
                  class="ais-Menu-count"
                >
                  591
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  HP
                </span>
                <span
                  class="ais-Menu-count"
                >
                  530
                </span>
              </a>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('limits the number of items to display', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'brand',
          limit: 2,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(2);
      expect(
        document.querySelector('.ais-Menu')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-Menu"
        >
          <ul
            class="ais-Menu-list"
          >
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Insignia™
                </span>
                <span
                  class="ais-Menu-count"
                >
                  746
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Samsung
                </span>
                <span
                  class="ais-Menu-count"
                >
                  633
                </span>
              </a>
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
          searchClient,
        },
        widgetParams: {
          attribute: 'brand',
          transformItems: (items) =>
            items.map((item) => ({ ...item, label: item.label.toUpperCase() })),
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        Array.from(document.querySelectorAll('.ais-Menu-item')).map((item) => [
          item.querySelector('.ais-Menu-label')!.textContent,
          item.querySelector('.ais-Menu-count')!.textContent,
        ])
      ).toEqual([
        ['INSIGNIA™', '746'],
        ['SAMSUNG', '633'],
        ['METRA', '591'],
        ['HP', '530'],
      ]);
    });

    test('refines on user action', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'brand',
        },
      });

      await act(async () => {
        await wait(0);
      });

      const firstItem = () =>
        document.querySelector<HTMLAnchorElement>('.ais-Menu-item')!;
      expect(firstItem()).not.toHaveClass('ais-Menu-item--selected');

      await act(async () => {
        userEvent.click(firstItem().querySelector('.ais-Menu-link')!);
        await wait(0);
      });

      expect(firstItem()).toHaveClass('ais-Menu-item--selected');

      // Once on load, once on check.
      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              facetFilters: [['brand:Insignia™']],
            }),
          }),
        ])
      );
    });

    describe('sorting', () => {
      test('sorts the items by ascending name', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            sortBy: ['name:asc'],
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(document.querySelectorAll('.ais-Menu-label')).map(
            (item) => item.textContent
          )
        ).toEqual(['HP', 'Insignia™', 'Metra', 'Samsung']);
      });

      test('sorts the items by descending name', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            sortBy: ['name:desc'],
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(document.querySelectorAll('.ais-Menu-label')).map(
            (item) => item.textContent
          )
        ).toEqual(['Samsung', 'Metra', 'Insignia™', 'HP']);
      });

      test('sorts the items by count', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            sortBy: ['count'],
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(document.querySelectorAll('.ais-Menu-count')).map(
            (item) => item.textContent
          )
        ).toEqual(['746', '633', '591', '530']);
      });

      test('sorts the items by refinement state', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            sortBy: ['isRefined', 'name'],
            transformItems: (items) =>
              items.map((item) => ({
                ...item,
                label: `${item.label} ${item.isRefined ? 'y' : 'n'}`,
              })),
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(document.querySelectorAll('.ais-Menu-label')).map(
            (item) => item.textContent
          )
        ).toEqual(['HP n', 'Insignia™ n', 'Metra n', 'Samsung n']);

        await act(async () => {
          userEvent.click(screen.getByText('Samsung n'));
          await wait(0);
        });

        expect(
          Array.from(document.querySelectorAll('.ais-Menu-label')).map(
            (item) => item.textContent
          )
        ).toEqual(['Samsung y', 'HP n', 'Insignia™ n', 'Metra n']);

        await act(async () => {
          userEvent.click(screen.getByText('Metra n'));
          await wait(0);
        });

        expect(
          Array.from(document.querySelectorAll('.ais-Menu-label')).map(
            (item) => item.textContent
          )
        ).toEqual(['Metra y', 'HP n', 'Insignia™ n', 'Samsung n']);
      });

      test('sorts the items using a sorting function', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            sortBy: (a, b) => b.name.localeCompare(a.name),
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(document.querySelectorAll('.ais-Menu-label')).map(
            (item) => item.textContent
          )
        ).toEqual(['Samsung', 'Metra', 'Insignia™', 'HP']);
      });
    });

    describe('show more / less', () => {
      test('displays a "Show more" button', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            limit: 2,
            showMore: true,
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(2);

        const showMoreButton = screen.getByRole('button');
        expect(showMoreButton).toHaveTextContent('Show more');
        expect(
          document.querySelector('.ais-Menu')
        ).toMatchNormalizedInlineSnapshot(
          normalizeSnapshot,
          `
          <div
            class="ais-Menu"
          >
            <ul
              class="ais-Menu-list"
            >
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Insignia™
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    746
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Samsung
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    633
                  </span>
                </a>
              </li>
            </ul>
            <button
              class="ais-Menu-showMore"
            >
              Show more
            </button>
          </div>
        `
        );

        await act(async () => {
          userEvent.click(showMoreButton);
          await wait(0);
        });

        expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(4);
        expect(showMoreButton).toHaveTextContent('Show less');
      });

      test('limits the number of items to reveal', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            limit: 2,
            showMore: true,
            showMoreLimit: 3,
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(2);

        const showMoreButton = screen.getByRole('button');

        await act(async () => {
          userEvent.click(showMoreButton);
          await wait(0);
        });

        expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(3);
      });

      test('disables the button when there are no more items to reveal', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            showMore: true,
            limit: 10,
            showMoreLimit: 11,
          },
        });

        await act(async () => {
          await wait(0);
        });

        const showMoreButton = screen.getByRole('button');
        expect(showMoreButton).toBeDisabled();
      });
    });
  });
}
