import {
  createAlgoliaSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { normalizeSnapshot, wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { MenuWidgetSetup } from '.';
import type { TestOptions } from '../../common';

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
                    Apple: 442,
                    GE: 394,
                    Sony: 350,
                    Incipio: 320,
                    KitchenAid: 318,
                    Whirlpool: 298,
                    LG: 291,
                    Canon: 287,
                    Frigidaire: 275,
                    Speck: 216,
                    OtterBox: 214,
                    Epson: 204,
                    'Dynex™': 184,
                    Dell: 174,
                    'Hamilton Beach': 173,
                    Platinum: 155,
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

      expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(10);
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
                  Apple
                </span>
                <span
                  class="ais-Menu-count"
                >
                  442
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
                  GE
                </span>
                <span
                  class="ais-Menu-count"
                >
                  394
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
                  Sony
                </span>
                <span
                  class="ais-Menu-count"
                >
                  350
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
                  Incipio
                </span>
                <span
                  class="ais-Menu-count"
                >
                  320
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
                  KitchenAid
                </span>
                <span
                  class="ais-Menu-count"
                >
                  318
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
                  Whirlpool
                </span>
                <span
                  class="ais-Menu-count"
                >
                  298
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
          limit: 5,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(5);
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
                  Apple
                </span>
                <span
                  class="ais-Menu-count"
                >
                  442
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
        ['APPLE', '442'],
        ['GE', '394'],
        ['SONY', '350'],
        ['INCIPIO', '320'],
        ['KITCHENAID', '318'],
        ['WHIRLPOOL', '298'],
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
        ).toEqual([
          'Apple',
          'Canon',
          'Dell',
          'Dynex™',
          'Epson',
          'Frigidaire',
          'GE',
          'HP',
          'Hamilton Beach',
          'Incipio',
        ]);
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
        ).toEqual([
          'Whirlpool',
          'Speck',
          'Sony',
          'Samsung',
          'Platinum',
          'OtterBox',
          'Metra',
          'LG',
          'KitchenAid',
          'Insignia™',
        ]);
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
        ).toEqual([
          '746',
          '633',
          '591',
          '530',
          '442',
          '394',
          '350',
          '320',
          '318',
          '298',
        ]);
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
        ).toEqual([
          'Apple n',
          'Canon n',
          'Dell n',
          'Dynex™ n',
          'Epson n',
          'Frigidaire n',
          'GE n',
          'HP n',
          'Hamilton Beach n',
          'Incipio n',
        ]);

        await act(async () => {
          userEvent.click(screen.getByText('Hamilton Beach n'));
          await wait(0);
        });

        expect(
          Array.from(document.querySelectorAll('.ais-Menu-label')).map(
            (item) => item.textContent
          )
        ).toEqual([
          'Hamilton Beach y',
          'Apple n',
          'Canon n',
          'Dell n',
          'Dynex™ n',
          'Epson n',
          'Frigidaire n',
          'GE n',
          'HP n',
          'Incipio n',
        ]);

        await act(async () => {
          userEvent.click(screen.getByText('Frigidaire n'));
          await wait(0);
        });

        expect(
          Array.from(document.querySelectorAll('.ais-Menu-label')).map(
            (item) => item.textContent
          )
        ).toEqual([
          'Frigidaire y',
          'Apple n',
          'Canon n',
          'Dell n',
          'Dynex™ n',
          'Epson n',
          'GE n',
          'HP n',
          'Hamilton Beach n',
          'Incipio n',
        ]);
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
        ).toEqual([
          'Whirlpool',
          'Speck',
          'Sony',
          'Samsung',
          'Platinum',
          'OtterBox',
          'Metra',
          'LG',
          'KitchenAid',
          'Insignia™',
        ]);
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
            showMore: true,
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(10);

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
                    Apple
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    442
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
                    GE
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    394
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
                    Sony
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    350
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
                    Incipio
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    320
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
                    KitchenAid
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    318
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
                    Whirlpool
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    298
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

        expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(20);
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
            showMore: true,
            showMoreLimit: 11,
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(10);

        const showMoreButton = screen.getByRole('button');

        await act(async () => {
          userEvent.click(showMoreButton);
          await wait(0);
        });

        expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(11);
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
            limit: 20,
            showMoreLimit: 21,
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
