/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchTestWrapper, wait } from '@instantsearch/testutils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { EXPERIMENTAL_Autocomplete } from '../Autocomplete';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
  });
});

describe('Autocomplete', () => {
  function createMockedSearchClient(
    response: ReturnType<typeof createMultiSearchResponse>
  ) {
    return createSearchClient({
      // @ts-expect-error - doesn't properly handle multi index, expects all responses to be of the same type
      search: jest.fn(() => Promise.resolve(response)),
    });
  }

  test('should render a searchbox and indices with hits', async () => {
    const searchClient = createMockedSearchClient(
      createMultiSearchResponse(
        createSingleSearchResponse({
          index: 'indexName',
          hits: [{ objectID: '1', name: 'Item 1' }],
        }),
        // @ts-expect-error - ignore second response type
        createSingleSearchResponse({
          index: 'indexName2',
          hits: [{ objectID: '2', query: 'hello' }],
        })
      )
    );
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <EXPERIMENTAL_Autocomplete
          indices={[
            {
              indexName: 'indexName',
              itemComponent: (props) => props.item.name,
            },
            {
              indexName: 'indexName2',
              itemComponent: (props) => props.item.query,
            },
          ]}
        />
      </InstantSearchTestWrapper>
    );

    await screen.findByText('Item 1');

    expect(screen.getByRole('search')).toMatchInlineSnapshot(`
      <form
        action=""
        class="ais-AutocompleteForm"
        novalidate=""
        role="search"
      >
        <div
          class="ais-AutocompleteInputWrapperPrefix"
        >
          <label
            aria-label="Submit"
            class="ais-AutocompleteLabel"
            for="autocomplete:r0:input"
            id="autocomplete:r0:input-label"
          >
            <button
              class="ais-AutocompleteSubmitButton"
              title="Submit"
              type="submit"
            >
              <svg
                class="ais-AutocompleteSubmitIcon"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M16.041 15.856c-0.034 0.026-0.067 0.055-0.099 0.087s-0.060 0.064-0.087 0.099c-1.258 1.213-2.969 1.958-4.855 1.958-1.933 0-3.682-0.782-4.95-2.050s-2.050-3.017-2.050-4.95 0.782-3.682 2.050-4.95 3.017-2.050 4.95-2.050 3.682 0.782 4.95 2.050 2.050 3.017 2.050 4.95c0 1.886-0.745 3.597-1.959 4.856zM21.707 20.293l-3.675-3.675c1.231-1.54 1.968-3.493 1.968-5.618 0-2.485-1.008-4.736-2.636-6.364s-3.879-2.636-6.364-2.636-4.736 1.008-6.364 2.636-2.636 3.879-2.636 6.364 1.008 4.736 2.636 6.364 3.879 2.636 6.364 2.636c2.125 0 4.078-0.737 5.618-1.968l3.675 3.675c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414z"
                />
              </svg>
            </button>
          </label>
          <div
            class="ais-AutocompleteLoadingIndicator"
            hidden=""
          >
            <svg
              class="ais-AutocompleteLoadingIcon"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                fill="none"
                r="35"
                stroke="currentColor"
                stroke-dasharray="164.93361431346415 56.97787143782138"
                stroke-width="6"
              >
                <animatetransform
                  attributeName="transform"
                  dur="1s"
                  keyTimes="0;0.40;0.65;1"
                  repeatCount="indefinite"
                  type="rotate"
                  values="0 50 50;90 50 50;180 50 50;360 50 50"
                />
              </circle>
            </svg>
          </div>
        </div>
        <div
          class="ais-AutocompleteInputWrapper"
        >
          <input
            aria-autocomplete="list"
            aria-controls="autocomplete:r0:panel"
            aria-expanded="false"
            aria-haspopup="grid"
            aria-labelledby="autocomplete:r0:input-label"
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            class="ais-AutocompleteInput"
            enterkeyhint="search"
            id="autocomplete:r0:input"
            maxlength="512"
            role="combobox"
            spellcheck="false"
            type="search"
            value=""
          />
        </div>
        <div
          class="ais-AutocompleteInputWrapperSuffix"
        >
          <button
            class="ais-AutocompleteClearButton"
            hidden=""
            title="Clear"
            type="reset"
          >
            <svg
              class="ais-AutocompleteClearIcon"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5.293 6.707l5.293 5.293-5.293 5.293c-0.391 0.391-0.391 1.024 0 1.414s1.024 0.391 1.414 0l5.293-5.293 5.293 5.293c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414l-5.293-5.293 5.293-5.293c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0l-5.293 5.293-5.293-5.293c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414z"
              />
            </svg>
          </button>
        </div>
      </form>
    `);

    expect(container.querySelector('.ais-AutocompletePanel'))
      .toMatchInlineSnapshot(`
      <div
        aria-hidden="true"
        aria-labelledby="autocomplete:r0:input"
        class="ais-AutocompletePanel"
        id="autocomplete:r0:panel"
        role="grid"
      >
        <div
          class="ais-AutocompletePanelLayout"
        >
          <div
            class="ais-AutocompleteIndex"
          >
            <ol
              class="ais-AutocompleteIndexList"
            >
              <li
                aria-selected="false"
                class="ais-AutocompleteIndexItem"
                id="autocomplete:r0:item:indexName:0"
                role="row"
              >
                Item 1
              </li>
            </ol>
          </div>
          <div
            class="ais-AutocompleteIndex"
          >
            <ol
              class="ais-AutocompleteIndexList"
            >
              <li
                aria-selected="false"
                class="ais-AutocompleteIndexItem"
                id="autocomplete:r0:item:indexName2:0"
                role="row"
              >
                hello
              </li>
            </ol>
          </div>
        </div>
      </div>
    `);
  });

  test('should render suggestions', async () => {
    const searchClient = createMockedSearchClient(
      createMultiSearchResponse(
        createSingleSearchResponse({
          index: 'query_suggestions',
          hits: [
            { objectID: '1', query: 'hello' },
            { objectID: '2', query: 'hi' },
          ],
        })
      )
    );
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <EXPERIMENTAL_Autocomplete
          showSuggestions={{ indexName: 'query_suggestions' }}
        />
      </InstantSearchTestWrapper>
    );

    await screen.findByText('hello');

    expect(searchClient.search).toHaveBeenCalledTimes(2);
    expect(searchClient.search).toHaveBeenNthCalledWith(2, [
      {
        indexName: 'query_suggestions',
        params: expect.objectContaining({
          query: '',
        }),
      },
    ]);
    (searchClient.search as jest.Mock).mockClear();

    expect(container.querySelector('.ais-AutocompletePanel'))
      .toMatchInlineSnapshot(`
      <div
        aria-hidden="true"
        aria-labelledby="autocomplete:r1:input"
        class="ais-AutocompletePanel"
        id="autocomplete:r1:panel"
        role="grid"
      >
        <div
          class="ais-AutocompletePanelLayout"
        >
          <div
            class="ais-AutocompleteIndex ais-AutocompleteSuggestions"
          >
            <ol
              class="ais-AutocompleteIndexList ais-AutocompleteSuggestionsList"
            >
              <li
                aria-selected="false"
                class="ais-AutocompleteIndexItem ais-AutocompleteSuggestionsItem"
                id="autocomplete:r1:item:query_suggestions:0"
                role="row"
              >
                <div
                  class="ais-AutocompleteItemWrapper ais-AutocompleteSuggestionWrapper"
                >
                  <div
                    class="ais-AutocompleteItemContent ais-AutocompleteSuggestionItemContent"
                  >
                    <div
                      class="ais-AutocompleteItemIcon ais-AutocompleteSuggestionItemIcon"
                    >
                      <svg
                        class="ais-AutocompleteSubmitIcon"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M16.041 15.856c-0.034 0.026-0.067 0.055-0.099 0.087s-0.060 0.064-0.087 0.099c-1.258 1.213-2.969 1.958-4.855 1.958-1.933 0-3.682-0.782-4.95-2.050s-2.050-3.017-2.050-4.95 0.782-3.682 2.050-4.95 3.017-2.050 4.95-2.050 3.682 0.782 4.95 2.050 2.050 3.017 2.050 4.95c0 1.886-0.745 3.597-1.959 4.856zM21.707 20.293l-3.675-3.675c1.231-1.54 1.968-3.493 1.968-5.618 0-2.485-1.008-4.736-2.636-6.364s-3.879-2.636-6.364-2.636-4.736 1.008-6.364 2.636-2.636 3.879-2.636 6.364 1.008 4.736 2.636 6.364 3.879 2.636 6.364 2.636c2.125 0 4.078-0.737 5.618-1.968l3.675 3.675c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414z"
                        />
                      </svg>
                    </div>
                    <div
                      class="ais-AutocompleteItemContentBody ais-AutocompleteSuggestionItemContentBody"
                    >
                      hello
                    </div>
                  </div>
                  <div
                    class="ais-AutocompleteItemActions ais-AutocompleteSuggestionItemActions"
                  >
                    <button
                      class="ais-AutocompleteItemActionButton ais-AutocompleteSuggestionItemApplyButton"
                      title="Apply hello as search"
                      type="button"
                    >
                      <svg
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M8 17v-7.586l8.293 8.293c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414l-8.293-8.293h7.586c0.552 0 1-0.448 1-1s-0.448-1-1-1h-10c-0.552 0-1 0.448-1 1v10c0 0.552 0.448 1 1 1s1-0.448 1-1z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
              <li
                aria-selected="false"
                class="ais-AutocompleteIndexItem ais-AutocompleteSuggestionsItem"
                id="autocomplete:r1:item:query_suggestions:1"
                role="row"
              >
                <div
                  class="ais-AutocompleteItemWrapper ais-AutocompleteSuggestionWrapper"
                >
                  <div
                    class="ais-AutocompleteItemContent ais-AutocompleteSuggestionItemContent"
                  >
                    <div
                      class="ais-AutocompleteItemIcon ais-AutocompleteSuggestionItemIcon"
                    >
                      <svg
                        class="ais-AutocompleteSubmitIcon"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M16.041 15.856c-0.034 0.026-0.067 0.055-0.099 0.087s-0.060 0.064-0.087 0.099c-1.258 1.213-2.969 1.958-4.855 1.958-1.933 0-3.682-0.782-4.95-2.050s-2.050-3.017-2.050-4.95 0.782-3.682 2.050-4.95 3.017-2.050 4.95-2.050 3.682 0.782 4.95 2.050 2.050 3.017 2.050 4.95c0 1.886-0.745 3.597-1.959 4.856zM21.707 20.293l-3.675-3.675c1.231-1.54 1.968-3.493 1.968-5.618 0-2.485-1.008-4.736-2.636-6.364s-3.879-2.636-6.364-2.636-4.736 1.008-6.364 2.636-2.636 3.879-2.636 6.364 1.008 4.736 2.636 6.364 3.879 2.636 6.364 2.636c2.125 0 4.078-0.737 5.618-1.968l3.675 3.675c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414z"
                        />
                      </svg>
                    </div>
                    <div
                      class="ais-AutocompleteItemContentBody ais-AutocompleteSuggestionItemContentBody"
                    >
                      hi
                    </div>
                  </div>
                  <div
                    class="ais-AutocompleteItemActions ais-AutocompleteSuggestionItemActions"
                  >
                    <button
                      class="ais-AutocompleteItemActionButton ais-AutocompleteSuggestionItemApplyButton"
                      title="Apply hi as search"
                      type="button"
                    >
                      <svg
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M8 17v-7.586l8.293 8.293c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414l-8.293-8.293h7.586c0.552 0 1-0.448 1-1s-0.448-1-1-1h-10c-0.552 0-1 0.448-1 1v10c0 0.552 0.448 1 1 1s1-0.448 1-1z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    `);

    userEvent.click(screen.getByRole('combobox'));
    userEvent.click(screen.getByText(/hello/i));

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(2);
    });

    expect(searchClient.search).toHaveBeenLastCalledWith([
      {
        indexName: 'indexName',
        params: expect.objectContaining({
          query: 'hello',
        }),
      },
    ]);
  });

  test('should support keyboard navigation', async () => {
    const searchClient = createMockedSearchClient(
      createMultiSearchResponse(
        createSingleSearchResponse({
          index: 'indexName',
          hits: [
            { objectID: '1', name: 'Item 1' },
            { objectID: '2', name: 'Item 2' },
          ],
        }),
        // @ts-expect-error - ignore second response type
        createSingleSearchResponse({
          index: 'indexName2',
          hits: [
            { objectID: '1', query: 'hello' },
            { objectID: '2', query: 'world' },
          ],
        })
      )
    );
    const mockOnSelect = jest.fn();
    const { container } = render(
      <InstantSearchTestWrapper searchClient={searchClient}>
        <EXPERIMENTAL_Autocomplete
          indices={[
            {
              indexName: 'indexName',
              itemComponent: (props) => props.item.name,
            },
            {
              indexName: 'indexName2',
              itemComponent: (props) => props.item.query,
              onSelect: mockOnSelect,
            },
          ]}
        />
      </InstantSearchTestWrapper>
    );

    await screen.findByText('hello');

    expect(container.querySelectorAll('[aria-selected="true"]')).toHaveLength(
      0
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute(
      'aria-activedescendant'
    );

    // Highlight the first item
    userEvent.click(screen.getByRole('combobox'));
    userEvent.keyboard('{ArrowDown}');
    await wait(0);

    let selectedItem = screen.getByRole('row', { selected: true });
    expect(selectedItem).toHaveTextContent('Item 1');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      selectedItem.id
    );

    // Loop to the second-to-last item, from the second index
    userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await wait(0);

    selectedItem = screen.getByRole('row', { selected: true });
    expect(selectedItem).toHaveTextContent('hello');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      selectedItem.id
    );

    // Handle Enter
    userEvent.keyboard('{Enter}');
    await wait(0);

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        item: expect.objectContaining({ objectID: '1', query: 'hello' }),
      })
    );
  });

  describe('detached mode', () => {
    const originalMatchMedia = window.matchMedia;

    function createMatchMedia(matches: boolean) {
      return jest.fn().mockImplementation((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
    }

    function createDynamicMatchMedia(
      initialMatches: Record<string, boolean>
    ): {
      matchMedia: typeof window.matchMedia;
      setMatches: (query: string, matches: boolean) => void;
    } {
      const listeners = new Map<
        string,
        Set<(event: MediaQueryListEvent) => void>
      >();
      const mqlMap = new Map<string, MediaQueryList>();

      const getMql = (query: string) => {
        if (!mqlMap.has(query)) {
          const listenerSet = new Set<
            (event: MediaQueryListEvent) => void
          >();
          listeners.set(query, listenerSet);
          const mql = {
            matches: Boolean(initialMatches[query]),
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn((event: string, cb: EventListener) => {
              if (event === 'change') {
                listenerSet.add(cb as (event: MediaQueryListEvent) => void);
              }
            }),
            removeEventListener: jest.fn((event: string, cb: EventListener) => {
              if (event === 'change') {
                listenerSet.delete(cb as (event: MediaQueryListEvent) => void);
              }
            }),
            dispatchEvent: jest.fn(),
          } as MediaQueryList;
          mqlMap.set(query, mql);
        }

        return mqlMap.get(query)!;
      };

      return {
        matchMedia: jest.fn().mockImplementation(getMql),
        setMatches: (query: string, matches: boolean) => {
          const mql = getMql(query);
          (mql as { matches: boolean }).matches = matches;
          const event = { matches, media: query } as MediaQueryListEvent;
          listeners.get(query)?.forEach((listener) => listener(event));
        },
      };
    }

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
      document.body.classList.remove('ais-Autocomplete--detached');
    });

    test('should render detached search button when detached mode is active', async () => {
      window.matchMedia = createMatchMedia(true);

      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [{ objectID: '1', name: 'Item 1' }],
          })
        )
      );

      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <EXPERIMENTAL_Autocomplete
            detachedMediaQuery="(max-width: 680px)"
            indices={[
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      // Wait for the component to render
      await waitFor(() => {
        expect(
          container.querySelector('.ais-AutocompleteDetachedSearchButton')
        ).toBeInTheDocument();
      });

      // Should not render the search form initially
      expect(container.querySelector('.ais-AutocompleteForm')).toBeNull();
    });

    test('should open detached container and focus input when search button is clicked', async () => {
      window.matchMedia = createMatchMedia(true);

      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [{ objectID: '1', name: 'Item 1' }],
          })
        )
      );

      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <EXPERIMENTAL_Autocomplete
            detachedMediaQuery="(max-width: 680px)"
            indices={[
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await waitFor(() => {
        expect(
          container.querySelector('.ais-AutocompleteDetachedSearchButton')
        ).toBeInTheDocument();
      });

      // Click the detached search button
      const searchButton = container.querySelector(
        '.ais-AutocompleteDetachedSearchButton'
      )!;
      userEvent.click(searchButton);

      await waitFor(() => {
        expect(
          container.querySelector('.ais-AutocompleteDetachedOverlay')
        ).toBeInTheDocument();
        expect(
          container.querySelector('.ais-AutocompleteDetachedContainer')
        ).toBeInTheDocument();
        expect(
          container.querySelector('.ais-AutocompleteForm')
        ).toBeInTheDocument();
      });

      // Body should have the detached class for scroll prevention
      expect(document.body).toHaveClass('ais-Autocomplete--detached');

      // Input should be focused to show the keyboard on mobile
      const input = container.querySelector('.ais-AutocompleteInput');
      expect(input).toHaveFocus();
    });

    test('should close detached container when cancel button is clicked', async () => {
      window.matchMedia = createMatchMedia(true);

      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [{ objectID: '1', name: 'Item 1' }],
          })
        )
      );

      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <EXPERIMENTAL_Autocomplete
            detachedMediaQuery="(max-width: 680px)"
            indices={[
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await waitFor(() => {
        expect(
          container.querySelector('.ais-AutocompleteDetachedSearchButton')
        ).toBeInTheDocument();
      });

      // Open the container
      userEvent.click(
        container.querySelector('.ais-AutocompleteDetachedSearchButton')!
      );

      await waitFor(() => {
        expect(
          container.querySelector('.ais-AutocompleteDetachedContainer')
        ).toBeInTheDocument();
      });

      // Click the cancel button
      userEvent.click(
        container.querySelector('.ais-AutocompleteDetachedCancelButton')!
      );

      await waitFor(() => {
        expect(
          container.querySelector('.ais-AutocompleteDetachedContainer')
        ).toBeNull();
      });

      // Body should no longer have the detached class
      expect(document.body).not.toHaveClass('ais-Autocomplete--detached');
    });

    test('should support custom translations', async () => {
      window.matchMedia = createMatchMedia(true);

      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [{ objectID: '1', name: 'Item 1' }],
          })
        )
      );

      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <EXPERIMENTAL_Autocomplete
            detachedMediaQuery="(max-width: 680px)"
            translations={{
              detachedCancelButtonText: 'Annuler',
              detachedSearchButtonTitle: 'Rechercher',
            }}
            indices={[
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await waitFor(() => {
        expect(
          container.querySelector('.ais-AutocompleteDetachedSearchButton')
        ).toBeInTheDocument();
      });

      // Check that the search button has the custom title
      expect(
        container.querySelector('.ais-AutocompleteDetachedSearchButton')
      ).toHaveAttribute('title', 'Rechercher');

      // Open the overlay and check cancel button text
      userEvent.click(
        container.querySelector('.ais-AutocompleteDetachedSearchButton')!
      );

      await waitFor(() => {
        expect(
          container.querySelector('.ais-AutocompleteDetachedCancelButton')
        ).toHaveTextContent('Annuler');
      });
    });

    test('should not render detached mode when media query does not match', async () => {
      window.matchMedia = createMatchMedia(false);

      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [{ objectID: '1', name: 'Item 1' }],
          })
        )
      );

      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <EXPERIMENTAL_Autocomplete
            detachedMediaQuery="(max-width: 680px)"
            indices={[
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await screen.findByText('Item 1');

      // Should render the normal form, not the detached search button
      expect(
        container.querySelector('.ais-AutocompleteForm')
      ).toBeInTheDocument();
      expect(
        container.querySelector('.ais-AutocompleteDetachedSearchButton')
      ).toBeNull();
    });

    test('should disable detached mode when detachedMediaQuery is empty', async () => {
      window.matchMedia = createMatchMedia(true);

      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [{ objectID: '1', name: 'Item 1' }],
          })
        )
      );

      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <EXPERIMENTAL_Autocomplete
            detachedMediaQuery=""
            indices={[
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await screen.findByText('Item 1');

      // Should render the normal form, not the detached search button
      expect(
        container.querySelector('.ais-AutocompleteForm')
      ).toBeInTheDocument();
      expect(
        container.querySelector('.ais-AutocompleteDetachedSearchButton')
      ).toBeNull();
    });

    test('keeps detached modal open when switching from non-detached mode', async () => {
      const detachedQuery = '(max-width: 680px)';
      const modalQuery = '(min-width: 680px)';
      const { matchMedia, setMatches } = createDynamicMatchMedia({
        [detachedQuery]: false,
        [modalQuery]: true,
      });
      window.matchMedia = matchMedia;

      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [{ objectID: '1', name: 'Item 1' }],
          })
        )
      );

      const { container } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <EXPERIMENTAL_Autocomplete
            detachedMediaQuery={detachedQuery}
            indices={[
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ]}
          />
        </InstantSearchTestWrapper>
      );

      await waitFor(() => {
        expect(container.querySelector('.ais-AutocompleteForm')).toBeInTheDocument();
      });

      userEvent.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(
          container.querySelector('.ais-AutocompletePanel--open')
        ).toBeInTheDocument();
      });

      setMatches(detachedQuery, true);

      await waitFor(() => {
        expect(
          container.querySelector('.ais-AutocompleteDetachedOverlay')
        ).toBeInTheDocument();
        expect(
          container.querySelector('.ais-AutocompleteDetachedContainer')
        ).toBeInTheDocument();
      });

      expect(
        container.querySelector('.ais-AutocompleteDetachedContainer')
      ).toHaveClass('ais-AutocompleteDetachedContainer--modal');
    });
  });
});
