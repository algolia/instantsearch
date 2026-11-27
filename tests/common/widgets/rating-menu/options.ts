import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  castToJestMock,
  normalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { RatingMenuWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: RatingMenuWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('disables the items without results', async () => {
      const searchClient = createSearchClient({
        search: jest.fn((requests) =>
          Promise.resolve(
            createMultiSearchResponse(
              ...requests.map(() =>
                createSingleSearchResponse({
                  nbHits: 10,
                  facets: { rating: { 1: 10 } },
                  facets_stats: {
                    rating: { min: 1, max: 1, avg: 1, sum: 10 },
                  },
                })
              )
            )
          )
        ),
      });

      await setup({
        instantSearchOptions: { searchClient, indexName: 'indexName' },
        widgetParams: { attribute: 'rating' },
      });

      await act(async () => {
        await wait(0);
      });

      const items = document.querySelectorAll('.ais-RatingMenu-item');
      const disabledItem = items[0];
      const enabledItem = items[items.length - 1];

      expect(disabledItem).toHaveClass('ais-RatingMenu-item--disabled');
      expect(disabledItem.querySelector('a')).toBeNull();
      expect(
        disabledItem.querySelector('.ais-RatingMenu-link')
      ).toHaveAttribute('aria-disabled', 'true');
      expect(
        disabledItem.querySelector('.ais-RatingMenu-count')
      ).toHaveTextContent('0');
      expect(enabledItem).not.toHaveClass('ais-RatingMenu-item--disabled');
      expect(enabledItem.querySelector('a.ais-RatingMenu-link')).not.toBeNull();

      castToJestMock(searchClient.search).mockClear();
      userEvent.click(disabledItem.querySelector('.ais-RatingMenu-link')!);

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).not.toHaveBeenCalled();
    });

    test('renders with props', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
        },
        widgetParams: {
          attribute: 'rating',
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-RatingMenu')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-RatingMenu"
        >
          <svg
            style="display: none;"
          >
            <symbol
              id="ais-RatingMenu-starSymbol"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"
              />
            </symbol>
            <symbol
              id="ais-RatingMenu-starEmptySymbol"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"
              />
            </symbol>
          </svg>
          <ul
            class="ais-RatingMenu-list"
          >
            <li
              class="ais-RatingMenu-item"
            >
              <a
                aria-label="4 & up"
                class="ais-RatingMenu-link"
                href="#"
              >
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starSymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starSymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starSymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starSymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starEmptySymbol"
                  />
                </svg>
                <span
                  aria-hidden="true"
                  class="ais-RatingMenu-label"
                >
                  & Up
                </span>
                <span
                  class="ais-RatingMenu-count"
                >
                  16,075
                </span>
              </a>
            </li>
            <li
              class="ais-RatingMenu-item"
            >
              <a
                aria-label="3 & up"
                class="ais-RatingMenu-link"
                href="#"
              >
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starSymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starSymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starSymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starEmptySymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starEmptySymbol"
                  />
                </svg>
                <span
                  aria-hidden="true"
                  class="ais-RatingMenu-label"
                >
                  & Up
                </span>
                <span
                  class="ais-RatingMenu-count"
                >
                  17,697
                </span>
              </a>
            </li>
            <li
              class="ais-RatingMenu-item"
            >
              <a
                aria-label="2 & up"
                class="ais-RatingMenu-link"
                href="#"
              >
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starSymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starSymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starEmptySymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starEmptySymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starEmptySymbol"
                  />
                </svg>
                <span
                  aria-hidden="true"
                  class="ais-RatingMenu-label"
                >
                  & Up
                </span>
                <span
                  class="ais-RatingMenu-count"
                >
                  17,891
                </span>
              </a>
            </li>
            <li
              class="ais-RatingMenu-item"
            >
              <a
                aria-label="1 & up"
                class="ais-RatingMenu-link"
                href="#"
              >
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starSymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starEmptySymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starEmptySymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starEmptySymbol"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
                  height="24"
                  width="24"
                >
                  <use
                    href="#ais-RatingMenu-starEmptySymbol"
                  />
                </svg>
                <span
                  aria-hidden="true"
                  class="ais-RatingMenu-label"
                >
                  & Up
                </span>
                <span
                  class="ais-RatingMenu-count"
                >
                  18,047
                </span>
              </a>
            </li>
          </ul>
        </div>
      `
      );
    });

    test('limits the number of stars to display', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
        },
        widgetParams: {
          attribute: 'rating',
          max: 3,
        },
      });

      await act(async () => {
        await wait(0);
      });

      const items = document.querySelectorAll('.ais-RatingMenu-item');

      // `max` is exclusive, the number of items is max - 1
      expect(items).toHaveLength(2);

      items.forEach((item) =>
        expect(item.querySelectorAll('.ais-RatingMenu-starIcon')).toHaveLength(
          3
        )
      );
    });
  });
}

function createMockedSearchClient() {
  return createSearchClient({
    search: jest.fn((requests) => {
      return Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() =>
            createSingleSearchResponse({
              nbHits: 21469,
              facets: {
                rating: {
                  0: 3422,
                  1: 156,
                  2: 194,
                  3: 1622,
                  4: 13925,
                  5: 2150,
                },
              },
              facets_stats: {
                rating: {
                  min: 1,
                  max: 5,
                  avg: 2,
                  sum: 71860,
                },
              },
            })
          )
        )
      );
    }),
  });
}
