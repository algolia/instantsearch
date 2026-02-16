import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type { AutocompleteWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function createMockedSearchClient(
  response: ReturnType<typeof createMultiSearchResponse>
) {
  return createSearchClient({
    // @ts-expect-error - doesn't properly handle multi index, expects all responses to be of the same type
    search: jest.fn(() => Promise.resolve(response)),
  });
}

export function createOptionsTests(
  setup: AutocompleteWidgetSetup,
  { act, flavor }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default options', async () => {
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
                },
              },
              {
                indexName: 'indexName2',
                templates: {
                  item: (props) => props.item.query,
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
              {
                indexName: 'indexName2',
                itemComponent: (props) => props.item.query,
              },
            ],
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-Autocomplete')).toBeInTheDocument();
      expect(screen.getByRole('search')).toBeInTheDocument();
      expect(
        document.querySelector('.ais-AutocompletePanel')
      ).toBeInTheDocument();
      expect(document.querySelectorAll('.ais-AutocompleteIndex')).toHaveLength(
        2
      );

      await act(async () => {
        await wait(0);
      });

      const indicesItems = document.querySelectorAll(
        '.ais-AutocompleteIndexItem'
      );
      expect(indicesItems).toHaveLength(2);
      expect(indicesItems[0]).toHaveTextContent('Item 1');
      expect(indicesItems[1]).toHaveTextContent('hello');
    });

    test('renders suggestions', async () => {
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

      await setup({
        instantSearchOptions: {
          indexName: 'query_suggestions',
          searchClient,
        },
        widgetParams: {
          javascript: {
            showQuerySuggestions: {
              indexName: 'query_suggestions',
            },
          },
          react: {
            showQuerySuggestions: {
              indexName: 'query_suggestions',
            },
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenNthCalledWith(1, [
        {
          indexName: 'query_suggestions',
          params: expect.objectContaining({
            query: '',
          }),
        },
      ]);
      (searchClient.search as jest.Mock).mockClear();

      expect(screen.getAllByRole('row', { hidden: true }).length).toBe(2);
      expect(
        screen.getByRole('row', { name: 'hello', hidden: true })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('row', { name: 'hi', hidden: true })
      ).toBeInTheDocument();

      // click the hello combo box suggestion
      await act(async () => {
        screen.getByText('hello').click();
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'query_suggestions',
          params: expect.objectContaining({
            query: 'hello',
          }),
        },
      ]);
    });

    test('renders recent searches', async () => {
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

      await setup({
        instantSearchOptions: {
          indexName: 'query_suggestions',
          searchClient,
        },
        widgetParams: {
          javascript: {
            showQuerySuggestions: {
              indexName: 'query_suggestions',
            },
            showRecent: true,
          },
          react: {
            showQuerySuggestions: {
              indexName: 'query_suggestions',
            },
            showRecent: true,
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);

        // JS currently doesn't refine on focus
        if (flavor === 'javascript') {
          const input = screen.getByRole('combobox', {
            name: /submit/i,
          });
          userEvent.click(input);
          userEvent.type(input, 'a');
          userEvent.clear(input);
        }

        await wait(0);
      });

      // click the hello combo box suggestion
      await act(async () => {
        screen.getByText('hello').click();
        await wait(0);
      });

      const recentSearches = document.querySelectorAll(
        '.ais-AutocompleteRecentSearchesItem'
      );
      expect(recentSearches).toHaveLength(1);
      expect(recentSearches[0]).toHaveTextContent('hello');

      // It should not be duplicated in suggestions
      expect(screen.getAllByText('hello').length).toBe(1);

      await act(async () => {
        screen
          .getByRole('button', {
            name: /apply hi as search/i,
            hidden: true,
          })
          .click();
        await wait(0);
      });

      expect(screen.getByRole('combobox', { name: /submit/i })).toHaveValue(
        'hi'
      );

      await act(async () => {
        userEvent.clear(screen.getByRole('combobox', { name: /submit/i }));
        await wait(0);
      });

      await act(async () => {
        screen
          .getByRole('button', {
            name: /remove hello from recent searches/i,
            hidden: true,
          })
          .click();
        await wait(0);
      });

      const newRecentSearches = document.querySelectorAll(
        '.ais-AutocompleteRecentSearchesItem'
      );
      expect(newRecentSearches).toHaveLength(0);
    });

    test('does not render recent searches header when there are no recent searches', async () => {
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

      await setup({
        instantSearchOptions: {
          indexName: 'query_suggestions',
          searchClient,
        },
        widgetParams: {
          javascript: {
            showQuerySuggestions: {
              indexName: 'query_suggestions',
            },
            showRecent: {
              templates: {
                header: () => 'Recent Searches',
              },
            },
          },
          react: {
            showQuerySuggestions: {
              indexName: 'query_suggestions',
            },
            showRecent: {
              headerComponent: () => (
                <React.Fragment>Recent Searches</React.Fragment>
              ),
            },
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      // No recent searches yet, so the header should not be rendered
      expect(
        document.querySelector('.ais-AutocompleteRecentSearchesHeader')
      ).not.toBeInTheDocument();

      // Click on a suggestion to add it to recent searches
      await act(async () => {
        screen.getByText('hello').click();
        await wait(0);
      });

      // Now the header should be visible
      expect(
        document.querySelector('.ais-AutocompleteRecentSearchesHeader')
      ).toHaveTextContent('Recent Searches');
    });

    test('forwards search params to each index', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [],
          }),
          createSingleSearchResponse({
            index: 'indexName2',
            hits: [],
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
                },
                searchParameters: {
                  hitsPerPage: 10,
                },
              },
              {
                indexName: 'indexName2',
                templates: {
                  item: (props) => props.item.query,
                },
                searchParameters: {
                  hitsPerPage: 20,
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
                searchParameters: {
                  hitsPerPage: 10,
                },
              },
              {
                indexName: 'indexName2',
                itemComponent: (props) => props.item.query,
                searchParameters: {
                  hitsPerPage: 20,
                },
              },
            ],
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            hitsPerPage: 10,
          }),
        },
        {
          indexName: 'indexName2',
          params: expect.objectContaining({
            hitsPerPage: 20,
          }),
        },
      ]);
    });

    test('forwards base search params to all indices', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [],
          }),
          createSingleSearchResponse({
            index: 'indexName2',
            hits: [],
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
                },
                searchParameters: {
                  hitsPerPage: 20,
                },
              },
              {
                indexName: 'indexName2',
                templates: {
                  item: (props) => props.item.query,
                },
              },
            ],
            searchParameters: {
              userToken: 'user-123',
              enableRules: false,
              hitsPerPage: 10,
            },
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
                searchParameters: {
                  hitsPerPage: 20,
                },
              },
              {
                indexName: 'indexName2',
                itemComponent: (props) => props.item.query,
              },
            ],
            searchParameters: {
              userToken: 'user-123',
              enableRules: false,
              hitsPerPage: 10,
            },
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            userToken: 'user-123',
            enableRules: false,
            hitsPerPage: 20,
          }),
        },
        {
          indexName: 'indexName2',
          params: expect.objectContaining({
            userToken: 'user-123',
            enableRules: false,
            hitsPerPage: 10,
          }),
        },
      ]);
    });

    test('supports keyboard navigation', async () => {
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
                },
              },
              {
                indexName: 'indexName2',
                templates: {
                  item: (props) => props.item.query,
                },
                onSelect: mockOnSelect,
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
              {
                indexName: 'indexName2',
                itemComponent: (props) => props.item.query,
                onSelect: mockOnSelect,
              },
            ],
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelectorAll('[aria-selected="true"]')).toHaveLength(
        0
      );

      const input = screen.getByRole('combobox', { name: /submit/i });

      await act(async () => {
        userEvent.click(input);
        await wait(0);

        userEvent.keyboard('{ArrowDown}');
        await wait(0);
      });

      let selectedItem = document.querySelector(
        '.ais-AutocompleteIndexItem[aria-selected="true"]'
      );
      expect(selectedItem).not.toBeNull();
      expect(selectedItem!.textContent).toBe('Item 1');

      expect(input.getAttribute('aria-activedescendant')).toBe(
        selectedItem!.id
      );

      await act(async () => {
        userEvent.keyboard('{ArrowUp}');
        await wait(0);
        userEvent.keyboard('{ArrowUp}');
        await wait(0);
      });

      selectedItem = document.querySelector(
        '.ais-AutocompleteIndexItem[aria-selected="true"]'
      );
      expect(selectedItem).not.toBeNull();
      expect(selectedItem!.textContent).toBe('hello');

      expect(input.getAttribute('aria-activedescendant')).toBe(
        selectedItem!.id
      );

      await act(async () => {
        userEvent.keyboard('{Enter}');
        await wait(0);
      });

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          item: expect.objectContaining({ objectID: '1', query: 'hello' }),
        })
      );
    });

    test('refines with input value when no item is selected', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [
              { objectID: '1', name: 'Item 1' },
              { objectID: '2', name: 'Item 2' },
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
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ],
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      const input = screen.getByRole('combobox', { name: /submit/i });

      await act(async () => {
        userEvent.click(input);
        userEvent.type(input, 'Item 3');
        await wait(0);
      });

      expect(document.querySelectorAll('[aria-selected="true"]')).toHaveLength(
        0
      );
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            query: 'Item 3',
          }),
        },
      ]);
    });

    test('closes the panel then blurs the input when pressing enter', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [
              { objectID: '1', name: 'Item 1' },
              { objectID: '2', name: 'Item 2' },
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
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ],
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      const input = screen.getByRole('combobox', { name: /submit/i });

      await act(async () => {
        userEvent.click(input);
        userEvent.keyboard('{ArrowDown}');
        await wait(0);
      });

      expect(
        document.querySelector('[aria-selected="true"]')
      ).toHaveTextContent('Item 1');
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(input).toHaveFocus();

      // Closes panel on first Enter
      await act(async () => {
        userEvent.keyboard('{Enter}');
        await wait(0);
      });

      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveFocus();

      // Blurs input on second Enter
      await act(async () => {
        userEvent.keyboard('{Enter}');
        await wait(0);
      });

      expect(input).not.toHaveFocus();
    });

    test('closes the panel then clears the input when pressing escape', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [
              { objectID: '1', name: 'Item 1' },
              { objectID: '2', name: 'Item 2' },
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
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ],
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      const input = screen.getByRole('combobox', { name: /submit/i });

      await act(async () => {
        userEvent.click(input);
        userEvent.keyboard('{ArrowDown}');
        await wait(0);
      });

      expect(
        document.querySelector('[aria-selected="true"]')
      ).toHaveTextContent('Item 1');
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(input).toHaveFocus();

      // Closes panel on first Escape
      await act(async () => {
        userEvent.keyboard('{Escape}');
        await wait(0);
      });

      expect(
        document.querySelector('[aria-selected="true"]')
      ).toHaveTextContent('Item 1');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveFocus();

      // Clears selection on second Escape
      await act(async () => {
        userEvent.keyboard('{Escape}');
        await wait(0);
      });

      expect(document.querySelectorAll('[aria-selected="true"]')).toHaveLength(
        0
      );
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveFocus();
    });

    test('clearing the query also clears internal autocomplete query', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [
              { objectID: '1', name: 'Item 1' },
              { objectID: '2', name: 'Item 2' },
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
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ],
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      const input = screen.getByRole('combobox', { name: /submit/i });

      await act(async () => {
        userEvent.click(input);
        userEvent.type(input, 'Item 3');
        userEvent.keyboard('{Enter}');
        await wait(0);
        userEvent.keyboard('{Enter}');
        await wait(0);
      });

      expect(input).not.toHaveFocus();
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('button', { name: /clear/i })).toBeVisible();

      await act(async () => {
        userEvent.click(screen.getByRole('button', { name: /clear/i }));
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            query: '',
          }),
        },
      ]);
    });

    test('refocuses the input after clearing the query', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [
              { objectID: '1', name: 'Item 1' },
              { objectID: '2', name: 'Item 2' },
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
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ],
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      const input = screen.getByRole('combobox', { name: /submit/i });

      await act(async () => {
        userEvent.click(input);
        userEvent.type(input, 'Item 3');
        userEvent.keyboard('{Enter}');
        await wait(0);
        userEvent.keyboard('{Enter}');
        await wait(0);
      });

      expect(input).not.toHaveFocus();
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('button', { name: /clear/i })).toBeVisible();

      await act(async () => {
        userEvent.click(screen.getByRole('button', { name: /clear/i }));
        await wait(0);
      });

      expect(input).toHaveFocus();
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(
        screen.queryByRole('button', { name: /clear/i })
      ).not.toBeInTheDocument();
    });

    test('scrolls active descendant into view', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: Array.from({ length: 100 }, (_, i) => ({
              objectID: String(i + 1),
              name: `Item ${i + 1}`,
            })),
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
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ],
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      const input = screen.getByRole('combobox', { name: /submit/i });

      const mockScrollIntoView = jest.fn();
      const originalGetElementById = document.getElementById.bind(document);
      jest
        .spyOn(document, 'getElementById')
        // @ts-ignore
        .mockImplementation(() => ({ scrollIntoView: mockScrollIntoView }));

      await act(async () => {
        userEvent.click(input);
        await wait(0);

        userEvent.keyboard('{ArrowUp}');
        await wait(0);
      });

      const selectedItem = document.querySelector(
        '.ais-AutocompleteIndexItem[aria-selected="true"]'
      )!;
      expect(selectedItem).not.toBeNull();
      expect(selectedItem.textContent).toBe('Item 100');
      expect(mockScrollIntoView).toHaveBeenNthCalledWith(1, false);

      document.getElementById = originalGetElementById;
    });

    test('has reversed highlighting by default', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'query_suggestions',
            hits: [
              {
                objectID: '1',
                query: 'hello',
                _highlightResult: {
                  query: {
                    value: '<mark>hell</mark>o',
                    matchLevel: 'partial',
                    matchedWords: ['hell'],
                  },
                },
              },
              {
                objectID: '2',
                query: 'hi',
                _highlightResult: {
                  query: {
                    value: 'hi',
                    matchLevel: 'none',
                    matchedWords: [],
                  },
                },
              },
            ],
          })
        )
      );

      await setup({
        instantSearchOptions: {
          indexName: 'query_suggestions',
          searchClient,
        },
        widgetParams: {
          javascript: {
            showQuerySuggestions: {
              indexName: 'query_suggestions',
            },
          },
          react: {
            showQuerySuggestions: {
              indexName: 'query_suggestions',
            },
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-ReverseHighlight-nonHighlighted')
      ).toHaveTextContent('hell');
      expect(
        document.querySelector('.ais-ReverseHighlight-highlighted')
      ).toHaveTextContent('o');

      // this should not render any highlighted or nonHighlighted spans
      const hiItem = screen.getByText('hi');
      expect(hiItem).not.toHaveClass('ais-ReverseHighlight-highlighted');
      expect(hiItem).not.toHaveClass('ais-ReverseHighlight-nonHighlighted');
    });

    test('keeps input focused when clicking inside the panel', async () => {
      const searchClient = createMockedSearchClient(
        createMultiSearchResponse(
          createSingleSearchResponse({
            index: 'indexName',
            hits: [{ objectID: '1', name: 'Item 1' }],
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
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => props.item.name,
              },
            ],
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      const input = screen.getByRole('combobox', { name: /submit/i });

      await act(async () => {
        userEvent.click(input);
        await wait(0);
      });

      expect(input).toHaveFocus();

      const panel = document.querySelector('.ais-AutocompletePanel')!;

      await act(async () => {
        userEvent.click(panel);
        await wait(0);
      });

      expect(input).toHaveFocus();
    });

    test('applies query suggestions when clicking on the fill action button', async () => {
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

      await setup({
        instantSearchOptions: {
          indexName: 'query_suggestions',
          searchClient,
        },
        widgetParams: {
          javascript: {
            showQuerySuggestions: {
              indexName: 'query_suggestions',
            },
          },
          react: {
            showQuerySuggestions: {
              indexName: 'query_suggestions',
            },
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      const applyButton = screen.getByRole('button', {
        name: /apply hello as search/i,
        hidden: true,
      });
      expect(applyButton).toBeInTheDocument();

      await act(async () => {
        userEvent.click(applyButton);
        await wait(0);
      });

      expect(
        screen.getByRole('combobox', {
          name: /submit/i,
        })
      ).toHaveValue('hello');

      // 2 initial calls for the root index + suggestions index, then 1 for the suggestions index only
      expect(searchClient.search).toHaveBeenCalledTimes(3);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              query: 'hello',
            }),
          }),
        ])
      );
    });

    describe('transformItems', () => {
      test('applies to a single index correctly', async () => {
        const searchClient = createMockedSearchClient(
          createMultiSearchResponse(
            createSingleSearchResponse({
              index: 'indexName',
              hits: [
                { objectID: '1', name: 'Item 1' },
                { objectID: '2', name: 'Item 2' },
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
                  },
                },
              ],
              transformItems: (indices) =>
                indices.map((index) => ({
                  ...index,
                  hits: index.hits.map((item) => ({
                    ...item,
                    name: item.name.toUpperCase(),
                  })),
                })),
            },
            react: {
              indices: [
                {
                  indexName: 'indexName',
                  itemComponent: (props) => props.item.name,
                },
              ],
              transformItems: (indices) =>
                indices.map((index) => ({
                  ...index,
                  hits: index.hits.map((item) => ({
                    ...item,
                    name: item.name.toUpperCase(),
                  })),
                })),
            },
            vue: {},
          },
        });

        await act(async () => {
          await wait(0);
        });

        const indicesItems = document.querySelectorAll(
          '.ais-AutocompleteIndexItem'
        );
        expect(indicesItems).toHaveLength(2);
        expect(indicesItems[0]).toHaveTextContent('ITEM 1');
        expect(indicesItems[1]).toHaveTextContent('ITEM 2');
      });

      test('applies to query suggestions and a single index correctly', async () => {
        const searchClient = createMockedSearchClient(
          createMultiSearchResponse(
            createSingleSearchResponse({
              index: 'query_suggestions',
              hits: [
                { objectID: '1', query: 'hello' },
                { objectID: '2', query: 'hi' },
              ],
            }),
            // @ts-expect-error - ignore second response type
            createSingleSearchResponse({
              index: 'indexName',
              hits: [
                { objectID: '1', name: 'Item 1' },
                { objectID: '2', name: 'Item 2' },
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
              showQuerySuggestions: {
                indexName: 'query_suggestions',
              },
              indices: [
                {
                  indexName: 'indexName',
                  templates: {
                    item: (props) => props.item.name,
                  },
                },
              ],
              // reverse the order of appearance of suggestions and indices
              transformItems: (indices) => {
                const querySuggestions = indices.find(
                  (index) => index.indexName === 'query_suggestions'
                );
                const otherIndices = indices.filter(
                  (index) => index.indexName !== 'query_suggestions'
                );

                return [
                  ...otherIndices,
                  ...(querySuggestions ? [querySuggestions] : []),
                ];
              },
            },
            react: {
              showQuerySuggestions: {
                indexName: 'query_suggestions',
              },
              indices: [
                {
                  indexName: 'indexName',
                  itemComponent: (props) => props.item.name,
                },
              ],
              transformItems: (indices) => {
                const querySuggestions = indices.find(
                  (index) => index.indexName === 'query_suggestions'
                );
                const otherIndices = indices.filter(
                  (index) => index.indexName !== 'query_suggestions'
                );

                return [
                  ...otherIndices,
                  ...(querySuggestions ? [querySuggestions] : []),
                ];
              },
            },
            vue: {},
          },
        });

        await act(async () => {
          await wait(0);
        });

        const indicesItems = document.querySelectorAll(
          '.ais-AutocompleteIndexItem'
        );
        expect(indicesItems).toHaveLength(4);
        expect(indicesItems[0]).toHaveTextContent('Item 1');
        expect(indicesItems[1]).toHaveTextContent('Item 2');
        expect(indicesItems[2]).toHaveTextContent('hello');
        expect(indicesItems[3]).toHaveTextContent('hi');
      });

      test('reorders indices with correct keyboard navigation', async () => {
        const searchClient = createMockedSearchClient(
          createMultiSearchResponse(
            createSingleSearchResponse({
              index: 'indexName1',
              hits: [{ objectID: '1', name: 'Item 1' }],
            }),
            createSingleSearchResponse({
              index: 'indexName2',
              hits: [{ objectID: '1', name: 'Item 2' }],
            })
          )
        );

        await setup({
          instantSearchOptions: {
            indexName: 'indexName1',
            searchClient,
          },
          widgetParams: {
            javascript: {
              indices: [
                {
                  indexName: 'indexName1',
                  templates: {
                    item: (props) => props.item.name,
                  },
                },
                {
                  indexName: 'indexName2',
                  templates: {
                    item: (props) => props.item.name,
                  },
                },
              ],
              transformItems: (indices) => indices.slice().reverse(),
            },
            react: {
              indices: [
                {
                  indexName: 'indexName1',
                  itemComponent: (props) => props.item.name,
                },
                {
                  indexName: 'indexName2',
                  itemComponent: (props) => props.item.name,
                },
              ],
              transformItems: (indices) => indices.slice().reverse(),
            },
            vue: {},
          },
        });

        await act(async () => {
          await wait(0);
        });

        const input = screen.getByRole('combobox', { name: /submit/i });

        await act(async () => {
          userEvent.click(input);
          await wait(0);

          userEvent.keyboard('{ArrowDown}');
          await wait(0);
        });

        const selectedItem = document.querySelector(
          '.ais-AutocompleteIndexItem[aria-selected="true"]'
        );
        expect(selectedItem).not.toBeNull();
        expect(selectedItem!.textContent).toBe('Item 2');
      });

      test('reorders and deletes hits with correct keyboard navigation', async () => {
        const searchClient = createMockedSearchClient(
          createMultiSearchResponse(
            createSingleSearchResponse({
              index: 'indexName1',
              hits: [
                { objectID: '1', name: 'Item 1' },
                { objectID: '2', name: 'Item 2' },
              ],
            }),
            createSingleSearchResponse({
              index: 'indexName2',
              hits: [
                { objectID: '1', name: 'Item 3' },
                { objectID: '2', name: 'Item 4' },
              ],
            })
          )
        );

        await setup({
          instantSearchOptions: {
            indexName: 'indexName1',
            searchClient,
          },
          widgetParams: {
            javascript: {
              indices: [
                {
                  indexName: 'indexName1',
                  templates: {
                    item: (props) => props.item.name,
                  },
                },
                {
                  indexName: 'indexName2',
                  templates: {
                    item: (props) => props.item.name,
                  },
                },
              ],
              transformItems: (indices) => {
                const reversed = indices.slice().reverse();
                return reversed.map((index) => ({
                  ...index,
                  hits: index.hits.filter((_, idx) => idx % 2 === 0),
                }));
              },
            },
            react: {
              indices: [
                {
                  indexName: 'indexName1',
                  itemComponent: (props) => props.item.name,
                },
                {
                  indexName: 'indexName2',
                  itemComponent: (props) => props.item.name,
                },
              ],
              transformItems: (indices) => {
                const reversed = indices.slice().reverse();
                return reversed.map((index) => ({
                  ...index,
                  hits: index.hits.filter((_, idx) => idx % 2 === 0),
                }));
              },
            },
            vue: {},
          },
        });

        await act(async () => {
          await wait(0);
        });

        const input = screen.getByRole('combobox', { name: /submit/i });

        await act(async () => {
          userEvent.click(input);
          await wait(0);

          userEvent.keyboard('{ArrowDown}');
          await wait(0);
        });

        let selectedItem = document.querySelector(
          '.ais-AutocompleteIndexItem[aria-selected="true"]'
        );
        expect(selectedItem).not.toBeNull();
        expect(selectedItem!.textContent).toBe('Item 3');

        await act(async () => {
          userEvent.keyboard('{ArrowDown}');
          await wait(0);
        });

        selectedItem = document.querySelector(
          '.ais-AutocompleteIndexItem[aria-selected="true"]'
        );
        expect(selectedItem).not.toBeNull();
        expect(selectedItem!.textContent).toBe('Item 1');
      });
    });
  });
}
