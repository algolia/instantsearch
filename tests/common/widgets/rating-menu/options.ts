import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';

import type { RatingMenuWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function normalizeSnapshot(html: string) {
  return (
    commonNormalizeSnapshot(html)
      // Vue renders `xlink:href` instead of `href` for <use> elements
      .replace(/xlink:/g, '')
      // Vue InstantSearch doesn't format facet count
      .replace(
        /(<span class="ais-RatingMenu-count">)(.+?)(<\/span>)/g,
        (_, open, content, close) =>
          `${open}${content.replace(/[^\d]/g, '')}${close}`
      )
      // Vue renders extra whitespace between symbol elements
      .replace(/<\/symbol> <symbol/g, '</symbol><symbol')
      // Vue renders extra whitespace between closing svg and other elements
      .replace(/<\/svg> </g, '</svg><')
  );
}

export function createOptionsTests(
  setup: RatingMenuWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
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
              <div>
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
                    16075
                  </span>
                </a>
              </div>
            </li>
            <li
              class="ais-RatingMenu-item"
            >
              <div>
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
                    17697
                  </span>
                </a>
              </div>
            </li>
            <li
              class="ais-RatingMenu-item"
            >
              <div>
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
                    17891
                  </span>
                </a>
              </div>
            </li>
            <li
              class="ais-RatingMenu-item"
            >
              <div>
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
                    18047
                  </span>
                </a>
              </div>
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
