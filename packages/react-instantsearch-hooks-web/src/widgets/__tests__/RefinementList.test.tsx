/**
 * @jest-environment jsdom
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSFFVResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchHooksTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { RefinementList } from '../RefinementList';

const FACET_HITS = [
  {
    value: 'Apple',
    highlighted: '__ais-highlight__App__/ais-highlight__le',
    count: 442,
  },
  {
    value: 'Alpine',
    highlighted: '__ais-highlight__Alp__/ais-highlight__ine',
    count: 30,
  },
  {
    value: 'APC',
    highlighted: '__ais-highlight__AP__/ais-highlight__C',
    count: 24,
  },
  {
    value: 'Amped Wireless',
    highlighted: '__ais-highlight__Amp__/ais-highlight__ed Wireless',
    count: 4,
  },
  {
    value: "Applebee's",
    highlighted: "__ais-highlight__App__/ais-highlight__lebee's",
    count: 2,
  },
  {
    value: 'Amplicom',
    highlighted: '__ais-highlight__Amp__/ais-highlight__licom',
    count: 1,
  },
  {
    value: 'Apollo Enclosures',
    highlighted: '__ais-highlight__Ap__/ais-highlight__ollo Enclosures',
    count: 1,
  },
  {
    value: 'Apple®',
    highlighted: '__ais-highlight__App__/ais-highlight__le®',
    count: 1,
  },
  {
    value: 'Applica',
    highlighted: '__ais-highlight__App__/ais-highlight__lica',
    count: 1,
  },
  {
    value: 'Apricorn',
    highlighted: '__ais-highlight__Ap__/ais-highlight__ricorn',
    count: 1,
  },
];

function createMockedSearchClient(parameters: Record<string, any> = {}) {
  return createSearchClient({
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
            })
          )
        )
      );
    }),
    searchForFacetValues: jest.fn(() =>
      Promise.resolve([
        createSFFVResponse({
          facetHits: FACET_HITS,
        }),
      ])
    ),
    ...parameters,
  });
}

describe('RefinementList', () => {
  test('renders with props', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <RefinementList attribute="brand" />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() =>
      expect(
        container.querySelectorAll('.ais-RefinementList-item')
      ).toHaveLength(10)
    );

    expect(searchClient.search).toHaveBeenCalledTimes(1);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-RefinementList"
        >
          <ul
            class="ais-RefinementList-list"
          >
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Insignia™"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Insignia™
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  746
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Samsung"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Samsung
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  633
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Metra"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Metra
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  591
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="HP"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  HP
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  530
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Apple"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Apple
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  442
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="GE"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  GE
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  394
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Sony"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Sony
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  350
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Incipio"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Incipio
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  320
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="KitchenAid"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  KitchenAid
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  318
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Whirlpool"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Whirlpool
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  298
                </span>
              </label>
            </li>
          </ul>
        </div>
      </div>
    `);

    const firstCheckbox = container.querySelector(
      '.ais-RefinementList-checkbox'
    ) as HTMLInputElement;

    expect(firstCheckbox).not.toBeChecked();

    userEvent.click(firstCheckbox);

    await waitFor(() => {
      expect(firstCheckbox).toBeChecked();

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
  });

  test('enables conjunctive faceting', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <RefinementList attribute="brand" operator="and" />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(
        container.querySelectorAll('.ais-RefinementList-item').length
      ).toEqual(10);
    });

    const [checkbox1, checkbox2] = [
      ...container.querySelectorAll<HTMLInputElement>(
        '.ais-RefinementList-checkbox'
      ),
    ].slice(0, 2);

    userEvent.click(checkbox1); // client.search call 2
    userEvent.click(checkbox2); // client.search call 3

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(3));

    expect(searchClient.search).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          params: expect.objectContaining({
            facetFilters: ['brand:Insignia™', 'brand:Samsung'],
          }),
        }),
      ])
    );
  });

  test('limits the number of items to display', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <RefinementList attribute="brand" limit={5} />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() =>
      expect(
        container.querySelectorAll('.ais-RefinementList-item')
      ).toHaveLength(5)
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-RefinementList"
        >
          <ul
            class="ais-RefinementList-list"
          >
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Insignia™"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Insignia™
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  746
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Samsung"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Samsung
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  633
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Metra"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Metra
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  591
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="HP"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  HP
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  530
                </span>
              </label>
            </li>
            <li
              class="ais-RefinementList-item"
            >
              <label
                class="ais-RefinementList-label"
              >
                <input
                  class="ais-RefinementList-checkbox"
                  type="checkbox"
                  value="Apple"
                />
                <span
                  class="ais-RefinementList-labelText"
                >
                  Apple
                </span>
                <span
                  class="ais-RefinementList-count"
                >
                  442
                </span>
              </label>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('transforms the items', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <RefinementList
          attribute="brand"
          transformItems={(items) =>
            items.map((item) => ({
              ...item,
              highlighted: item.highlighted!.toUpperCase(),
            }))
          }
        />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => {
      expect(
        Array.from(container.querySelectorAll('.ais-RefinementList-item')).map(
          (item) => item.textContent
        )
      ).toEqual([
        'Insignia™746',
        'Samsung633',
        'Metra591',
        'HP530',
        'Apple442',
        'GE394',
        'Sony350',
        'Incipio320',
        'KitchenAid318',
        'Whirlpool298',
      ]);
    });
  });

  describe('sorting', () => {
    test('sorts the items by ascending name', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <RefinementList attribute="brand" sortBy={['name:asc']} />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() => {
        expect(
          Array.from(
            container.querySelectorAll('.ais-RefinementList-labelText')
          ).map((item) => item.textContent)
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
    });

    test('sorts the items by descending name', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <RefinementList attribute="brand" sortBy={['name:desc']} />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() => {
        expect(
          Array.from(
            container.querySelectorAll('.ais-RefinementList-labelText')
          ).map((item) => item.textContent)
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

    test('sorts the items by count', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <RefinementList attribute="brand" sortBy={['count']} />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() => {
        expect(
          Array.from(
            container.querySelectorAll('.ais-RefinementList-count')
          ).map((item) => item.textContent)
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
    });

    test('sorts the items by refinement state', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <RefinementList attribute="brand" sortBy={['isRefined']} />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() => {
        expect(
          Array.from(
            container.querySelectorAll('.ais-RefinementList-labelText')
          ).map((item) => item.textContent)
        ).toEqual([
          'Insignia™',
          'Samsung',
          'Metra',
          'HP',
          'Apple',
          'GE',
          'Sony',
          'Incipio',
          'KitchenAid',
          'Whirlpool',
        ]);
      });

      const [checkbox1, checkbox2] = Array.from(
        container.querySelectorAll<HTMLInputElement>(
          '.ais-RefinementList-checkbox'
        )
      ).slice(-2);

      userEvent.click(checkbox1);
      userEvent.click(checkbox2);

      await waitFor(() => {
        expect(
          Array.from(
            container.querySelectorAll('.ais-RefinementList-labelText')
          ).map((item) => item.textContent)
        ).toEqual([
          'KitchenAid',
          'Whirlpool',
          'Insignia™',
          'Samsung',
          'Metra',
          'HP',
          'Apple',
          'GE',
          'Sony',
          'Incipio',
        ]);
      });
    });

    test('sorts the items using a sorting function', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <RefinementList
            attribute="brand"
            sortBy={(a, b) => a.name.length - b.name.length}
          />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() => {
        expect(
          Array.from(
            container.querySelectorAll('.ais-RefinementList-labelText')
          ).map((item) => item.textContent)
        ).toEqual([
          'HP',
          'GE',
          'LG',
          'Sony',
          'Dell',
          'Metra',
          'Apple',
          'Canon',
          'Speck',
          'Epson',
        ]);
      });
    });
  });

  describe('searching', () => {
    test('displays a search box', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <RefinementList
            attribute="brand"
            searchable={true}
            searchablePlaceholder="Search brands"
          />
        </InstantSearchHooksTestWrapper>
      );

      const searchInput = container.querySelector(
        '.ais-SearchBox-input'
      ) as HTMLInputElement;

      await waitFor(() => {
        expect(
          container.querySelector('.ais-RefinementList-searchBox')
        ).toBeInTheDocument();
        expect(searchInput).toHaveAttribute('placeholder', 'Search brands');
        expect(
          container.querySelector('.ais-Highlight-nonHighlighted')
        ).toBeNull();
        expect(
          container.querySelector('.ais-Highlight-highlighted')
        ).toBeNull();
        expect(
          Array.from(
            container.querySelectorAll('.ais-RefinementList-labelText')
          ).map((item) => item.textContent)
        ).toEqual([
          'Insignia™',
          'Samsung',
          'Metra',
          'HP',
          'Apple',
          'GE',
          'Sony',
          'Incipio',
          'KitchenAid',
          'Whirlpool',
        ]);
      });

      userEvent.type(searchInput, 'app');

      await waitFor(() => {
        // One call per keystroke
        expect(searchClient.searchForFacetValues).toHaveBeenCalledTimes(3);
        expect(searchClient.searchForFacetValues).toHaveBeenLastCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              params: expect.objectContaining({
                facetName: 'brand',
                facetQuery: 'app',
              }),
            }),
          ])
        );
        expect(
          container.querySelector('.ais-Highlight-nonHighlighted')
        ).not.toBeNull();
        expect(
          container.querySelector('.ais-Highlight-highlighted')
        ).not.toBeNull();
        expect(
          Array.from(
            container.querySelectorAll('.ais-RefinementList-labelText')
          ).map((item) => item.textContent)
        ).toEqual([
          'Apple',
          'Alpine',
          'APC',
          'Amped Wireless',
          "Applebee's",
          'Amplicom',
          'Apollo Enclosures',
          'Apple®',
          'Applica',
          'Apricorn',
        ]);
      });
    });

    test('displays a fallback when there are no results', async () => {
      const searchClient = createMockedSearchClient({
        searchForFacetValues: jest.fn(() =>
          Promise.resolve([createSFFVResponse({ facetHits: [] })])
        ),
      });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <RefinementList
            attribute="brand"
            searchable={true}
            searchablePlaceholder="Search brands"
          />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

      userEvent.type(
        container.querySelector('.ais-SearchBox-input') as HTMLInputElement,
        'nothing'
      );

      await waitFor(() => {
        expect(searchClient.searchForFacetValues).toHaveBeenCalledTimes(7);

        expect(
          container.querySelector('.ais-RefinementList-noResults')
        ).toHaveTextContent('No results.');
      });

      expect(container.querySelector('.ais-RefinementList-list')).toBeNull();
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-RefinementList"
          >
            <div
              class="ais-RefinementList-searchBox"
            >
              <div
                class="ais-SearchBox"
              >
                <form
                  action=""
                  class="ais-SearchBox-form"
                  novalidate=""
                >
                  <input
                    autocapitalize="off"
                    autocomplete="off"
                    autocorrect="off"
                    class="ais-SearchBox-input"
                    maxlength="512"
                    placeholder="Search brands"
                    spellcheck="false"
                    type="search"
                    value="nothing"
                  />
                  <button
                    class="ais-SearchBox-submit"
                    title="Submit the search query"
                    type="submit"
                  >
                    <svg
                      class="ais-SearchBox-submitIcon"
                      height="10"
                      viewBox="0 0 40 40"
                      width="10"
                    >
                      <path
                        d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
                      />
                    </svg>
                  </button>
                  <button
                    class="ais-SearchBox-reset"
                    title="Clear the search query"
                    type="reset"
                  >
                    <svg
                      class="ais-SearchBox-resetIcon"
                      height="10"
                      viewBox="0 0 20 20"
                      width="10"
                    >
                      <path
                        d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
                      />
                    </svg>
                  </button>
                  <span
                    class="ais-SearchBox-loadingIndicator"
                    hidden=""
                  >
                    <svg
                      class="ais-SearchBox-loadingIcon"
                      height="16"
                      stroke="#444"
                      viewBox="0 0 38 38"
                      width="16"
                    >
                      <g
                        fill="none"
                        fill-rule="evenodd"
                      >
                        <g
                          stroke-width="2"
                          transform="translate(1 1)"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="18"
                            stroke-opacity=".5"
                          />
                          <path
                            d="M36 18c0-9.94-8.06-18-18-18"
                          >
                            <animatetransform
                              attributeName="transform"
                              dur="1s"
                              from="0 18 18"
                              repeatCount="indefinite"
                              to="360 18 18"
                              type="rotate"
                            />
                          </path>
                        </g>
                      </g>
                    </svg>
                  </span>
                </form>
              </div>
            </div>
            <div
              class="ais-RefinementList-noResults"
            >
              No results.
            </div>
          </div>
        </div>
      `);
    });
  });

  describe('Show more / less', () => {
    test('displays a "Show more" button', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <RefinementList attribute="brand" showMore={true} />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() =>
        expect(
          container.querySelectorAll('.ais-RefinementList-item')
        ).toHaveLength(10)
      );

      const showMoreButton = container.querySelector(
        '.ais-RefinementList-showMore'
      ) as HTMLButtonElement;

      expect(showMoreButton).toHaveTextContent('Show more');

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-RefinementList"
          >
            <ul
              class="ais-RefinementList-list"
            >
              <li
                class="ais-RefinementList-item"
              >
                <label
                  class="ais-RefinementList-label"
                >
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Insignia™"
                  />
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Insignia™
                  </span>
                  <span
                    class="ais-RefinementList-count"
                  >
                    746
                  </span>
                </label>
              </li>
              <li
                class="ais-RefinementList-item"
              >
                <label
                  class="ais-RefinementList-label"
                >
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Samsung"
                  />
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Samsung
                  </span>
                  <span
                    class="ais-RefinementList-count"
                  >
                    633
                  </span>
                </label>
              </li>
              <li
                class="ais-RefinementList-item"
              >
                <label
                  class="ais-RefinementList-label"
                >
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Metra"
                  />
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Metra
                  </span>
                  <span
                    class="ais-RefinementList-count"
                  >
                    591
                  </span>
                </label>
              </li>
              <li
                class="ais-RefinementList-item"
              >
                <label
                  class="ais-RefinementList-label"
                >
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="HP"
                  />
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    HP
                  </span>
                  <span
                    class="ais-RefinementList-count"
                  >
                    530
                  </span>
                </label>
              </li>
              <li
                class="ais-RefinementList-item"
              >
                <label
                  class="ais-RefinementList-label"
                >
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Apple"
                  />
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Apple
                  </span>
                  <span
                    class="ais-RefinementList-count"
                  >
                    442
                  </span>
                </label>
              </li>
              <li
                class="ais-RefinementList-item"
              >
                <label
                  class="ais-RefinementList-label"
                >
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="GE"
                  />
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    GE
                  </span>
                  <span
                    class="ais-RefinementList-count"
                  >
                    394
                  </span>
                </label>
              </li>
              <li
                class="ais-RefinementList-item"
              >
                <label
                  class="ais-RefinementList-label"
                >
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Sony"
                  />
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Sony
                  </span>
                  <span
                    class="ais-RefinementList-count"
                  >
                    350
                  </span>
                </label>
              </li>
              <li
                class="ais-RefinementList-item"
              >
                <label
                  class="ais-RefinementList-label"
                >
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Incipio"
                  />
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Incipio
                  </span>
                  <span
                    class="ais-RefinementList-count"
                  >
                    320
                  </span>
                </label>
              </li>
              <li
                class="ais-RefinementList-item"
              >
                <label
                  class="ais-RefinementList-label"
                >
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="KitchenAid"
                  />
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    KitchenAid
                  </span>
                  <span
                    class="ais-RefinementList-count"
                  >
                    318
                  </span>
                </label>
              </li>
              <li
                class="ais-RefinementList-item"
              >
                <label
                  class="ais-RefinementList-label"
                >
                  <input
                    class="ais-RefinementList-checkbox"
                    type="checkbox"
                    value="Whirlpool"
                  />
                  <span
                    class="ais-RefinementList-labelText"
                  >
                    Whirlpool
                  </span>
                  <span
                    class="ais-RefinementList-count"
                  >
                    298
                  </span>
                </label>
              </li>
            </ul>
            <button
              class="ais-RefinementList-showMore"
            >
              Show more
            </button>
          </div>
        </div>
      `);

      userEvent.click(showMoreButton);

      await waitFor(() => {
        expect(showMoreButton).toHaveTextContent('Show less');
        expect(
          container.querySelectorAll('.ais-RefinementList-item')
        ).toHaveLength(20);
      });
    });

    test('limits the number of items to reveal', async () => {
      const searchClient = createMockedSearchClient();
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <RefinementList
            attribute="brand"
            showMore={true}
            showMoreLimit={11}
          />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() =>
        expect(
          container.querySelectorAll('.ais-RefinementList-item')
        ).toHaveLength(10)
      );

      expect(
        container.querySelector('.ais-RefinementList-showMore')
      ).toBeInTheDocument();

      userEvent.click(
        container.querySelector(
          '.ais-RefinementList-showMore'
        ) as HTMLButtonElement
      );

      await waitFor(() => {
        expect(
          container.querySelectorAll('.ais-RefinementList-item')
        ).toHaveLength(11);
        expect(
          container.querySelector('.ais-RefinementList-showMore')
        ).toBeInTheDocument();
      });
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <RefinementList
          attribute="brand"
          className="MyRefinementList"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyRefinementList', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('renders with translations', async () => {
    const searchClient = createMockedSearchClient({
      searchForFacetValues: jest.fn(
        ([
          {
            params: { facetQuery },
          },
        ]) => {
          return Promise.resolve([
            createSFFVResponse({
              facetHits: facetQuery === 'nothing' ? [] : FACET_HITS,
            }),
          ]);
        }
      ),
    });
    const { container, getByRole } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <RefinementList
          attribute="brand"
          showMore
          translations={{
            noResultsText: 'Zero results',
            resetButtonTitle: 'Reset',
            showMoreButtonText({ isShowingMore }: { isShowingMore: boolean }) {
              return isShowingMore ? 'Show less brands' : 'Show more brands';
            },
            submitButtonTitle: 'Submit',
          }}
          searchable
        />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    const showMoreButton = getByRole('button', { name: 'Show more brands' });
    expect(showMoreButton).toBeInTheDocument();
    userEvent.click(showMoreButton);

    await waitFor(() => {
      expect(showMoreButton).toHaveTextContent('Show less brands');
    });

    expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    userEvent.type(
      container.querySelector('.ais-SearchBox-input') as HTMLInputElement,
      'nothing'
    );

    expect(getByRole('button', { name: 'Reset' })).toBeInTheDocument();

    await waitFor(() => {
      expect(searchClient.searchForFacetValues).toHaveBeenCalledTimes(7);

      expect(
        container.querySelector('.ais-RefinementList-noResults')
      ).toHaveTextContent('Zero results');
    });
  });
});
