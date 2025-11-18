import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type { AutocompleteWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function normalizeSnapshot(expectedId: string) {
  return function _normalizeSnapshot(html: string) {
    // `useId()` in Preact and React have different patterns.
    return commonNormalizeSnapshot(html).replace(/(P\d{3}|:r.:)/g, expectedId);
  };
}

export function createTemplatesTests(
  setup: AutocompleteWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('templates', () => {
    test('renders indices headers', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName2',
            hits: [
              { objectID: '1', query: 'hello' },
              { objectID: '2', query: 'world' },
            ],
          }),
          // @ts-expect-error - ignore second response type
          createSingleSearchResponse({
            index: 'indexName',
            hits: [
              { objectID: '1', name: 'Item 1' },
              { objectID: '2', name: 'Item 2' },
              { objectID: '3', name: 'Item 3' },
            ],
          })
        )
      );

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            indices: [
              {
                indexName: 'indexName',
                templates: {
                  item: (props) => props.item.name,
                  header: (props) =>
                    `<span>${props.items.length} results</span>`,
                },
                cssClasses: { header: 'HEADER' },
              },
            ],
            showSuggestions: {
              indexName: 'indexName2',
              templates: {
                header: (props) => `<span>${props.items.length} results</span>`,
              },
              cssClasses: { header: 'HEADER' },
            },
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
                headerComponent: (props) => (
                  <span>{props.items.length} results</span>
                ),
                classNames: { header: 'HEADER' },
              },
            ],
            showSuggestions: {
              indexName: 'indexName2',
              headerComponent: (props) => (
                <span>{props.items.length} results</span>
              ),
              classNames: { header: 'HEADER' },
            },
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      const headers = [
        ...document.querySelectorAll('.ais-AutocompleteIndexHeader'),
      ];
      expect(headers).toHaveLength(2);
      expect(headers.map((header) => header.className)).toEqual([
        'ais-AutocompleteIndexHeader ais-AutocompleteSuggestionsHeader HEADER',
        'ais-AutocompleteIndexHeader HEADER',
      ]);
      expect(headers.map((header) => header.textContent)).toEqual([
        '2 results',
        '3 results',
      ]);
    });

    test('renders custom panel', async () => {
      jest
        .spyOn(Storage.prototype, 'getItem')
        .mockReturnValue(JSON.stringify(['hello']));

      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName2',
            hits: [
              { objectID: '1', query: 'hello' },
              { objectID: '2', query: 'world' },
            ],
          }),
          // @ts-expect-error - ignore second response type
          createSingleSearchResponse({
            index: 'indexName',
            hits: [
              { objectID: '1', name: 'Item 1' },
              { objectID: '2', name: 'Item 2' },
              { objectID: '3', name: 'Item 3' },
            ],
          })
        )
      );

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            indices: [
              {
                indexName: 'indexName',
                templates: { item: (props) => props.item.name },
              },
            ],
            showSuggestions: {
              indexName: 'indexName2',
              templates: { item: (props) => props.item.query },
            },
            showRecent: true,
            templates: {
              panel: ({ elements }, { html }) => html`
                <div>
                  <h1>My custom panel</h1>
                  <div class="left">
                    ${elements.recent} ${elements.suggestions}
                  </div>
                  <div class="right">${elements.indexName}</div>
                </div>
              `,
            },
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ],
            showSuggestions: {
              indexName: 'indexName2',
              // @ts-expect-error itemComponent can return a string
              itemComponent: (props) => props.item.query,
            },
            showRecent: true,
            panelComponent: ({ elements }) => (
              <div>
                <h1>My custom panel</h1>
                <div className="left">
                  {elements.recent} {elements.suggestions}
                </div>
                <div className="right">{elements.indexName}</div>
              </div>
            ),
          },
          vue: {},
        },
      });

      await act(async () => {
        userEvent.click(screen.queryByRole('combobox')!);
        await wait(0);
      });

      const panel = screen.queryByRole('grid');
      expect(panel).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot('P484'),
        `
        <div
          aria-labelledby="autocompleteP484input"
          class="ais-AutocompletePanel"
          id="autocompleteP484panel"
          role="grid"
        >
          <div
            class="ais-AutocompletePanelLayout"
          >
            <div>
              <h1>
                My custom panel
              </h1>
              <div
                class="left"
              >
                <div
                  class="ais-AutocompleteIndex ais-AutocompleteRecentSearches"
                >
                  <ol
                    class="ais-AutocompleteIndexList ais-AutocompleteRecentSearchesList"
                  >
                    <li
                      aria-selected="false"
                      class="ais-AutocompleteIndexItem ais-AutocompleteRecentSearchesItem"
                      id="autocompleteP484item:recent-searches:0"
                      role="row"
                    >
                      <div
                        class="ais-AutocompleteItemWrapper ais-AutocompleteRecentSearchWrapper"
                      >
                        <div
                          class="ais-AutocompleteItemContent ais-AutocompleteRecentSearchItemContent"
                        >
                          <div
                            class="ais-AutocompleteItemIcon ais-AutocompleteRecentSearchItemIcon"
                          >
                            <svg
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12.516 6.984v5.25l4.5 2.672-0.75 1.266-5.25-3.188v-6h1.5zM12 20.016q3.281 0 5.648-2.367t2.367-5.648-2.367-5.648-5.648-2.367-5.648 2.367-2.367 5.648 2.367 5.648 5.648 2.367zM12 2.016q4.125 0 7.055 2.93t2.93 7.055-2.93 7.055-7.055 2.93-7.055-2.93-2.93-7.055 2.93-7.055 7.055-2.93z"
                              />
                            </svg>
                          </div>
                          <div
                            class="ais-AutocompleteItemContentBody ais-AutocompleteRecentSearchItemContentBody"
                          >
                            hello
                          </div>
                        </div>
                        <div
                          class="ais-AutocompleteItemActions ais-AutocompleteRecentSearchItemActions"
                        >
                          <button
                            class="ais-AutocompleteItemActionButton ais-AutocompleteRecentSearchItemDeleteButton"
                            title="Remove hello from recent searches"
                          >
                            <svg
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M18 7v13c0 0.276-0.111 0.525-0.293 0.707s-0.431 0.293-0.707 0.293h-10c-0.276 0-0.525-0.111-0.707-0.293s-0.293-0.431-0.293-0.707v-13zM17 5v-1c0-0.828-0.337-1.58-0.879-2.121s-1.293-0.879-2.121-0.879h-4c-0.828 0-1.58 0.337-2.121 0.879s-0.879 1.293-0.879 2.121v1h-4c-0.552 0-1 0.448-1 1s0.448 1 1 1h1v13c0 0.828 0.337 1.58 0.879 2.121s1.293 0.879 2.121 0.879h10c0.828 0 1.58-0.337 2.121-0.879s0.879-1.293 0.879-2.121v-13h1c0.552 0 1-0.448 1-1s-0.448-1-1-1zM9 5v-1c0-0.276 0.111-0.525 0.293-0.707s0.431-0.293 0.707-0.293h4c0.276 0 0.525 0.111 0.707 0.293s0.293 0.431 0.293 0.707v1zM9 11v6c0 0.552 0.448 1 1 1s1-0.448 1-1v-6c0-0.552-0.448-1-1-1s-1 0.448-1 1zM13 11v6c0 0.552 0.448 1 1 1s1-0.448 1-1v-6c0-0.552-0.448-1-1-1s-1 0.448-1 1z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  </ol>
                </div>
                <div
                  class="ais-AutocompleteIndex ais-AutocompleteSuggestions"
                >
                  <ol
                    class="ais-AutocompleteIndexList ais-AutocompleteSuggestionsList"
                  >
                    <li
                      aria-selected="false"
                      class="ais-AutocompleteIndexItem ais-AutocompleteSuggestionsItem"
                      id="autocompleteP484item:indexName2:0"
                      role="row"
                    >
                      hello
                    </li>
                    <li
                      aria-selected="false"
                      class="ais-AutocompleteIndexItem ais-AutocompleteSuggestionsItem"
                      id="autocompleteP484item:indexName2:1"
                      role="row"
                    >
                      world
                    </li>
                  </ol>
                </div>
              </div>
              <div
                class="right"
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
                      id="autocompleteP484item:indexName:0"
                      role="row"
                    >
                      Item 1
                    </li>
                    <li
                      aria-selected="false"
                      class="ais-AutocompleteIndexItem"
                      id="autocompleteP484item:indexName:1"
                      role="row"
                    >
                      Item 2
                    </li>
                    <li
                      aria-selected="false"
                      class="ais-AutocompleteIndexItem"
                      id="autocompleteP484item:indexName:2"
                      role="row"
                    >
                      Item 3
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    });
  });
}

function createMockedSearchClient(
  response: ReturnType<typeof createMultiSearchResponse>
) {
  return createSearchClient({
    // @ts-expect-error - doesn't properly handle multi index, expects all responses to be of the same type
    search: jest.fn(() => Promise.resolve(response)),
  });
}
