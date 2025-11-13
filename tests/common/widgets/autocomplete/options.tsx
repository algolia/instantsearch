import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { AutocompleteWidgetSetup } from '.';
import type { SupportedFlavor, TestOptions } from '../../common';

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
            showSuggestions: {
              indexName: 'query_suggestions',
            },
          },
          react: {
            showSuggestions: {
              indexName: 'query_suggestions',
            },
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(0);
      });

      const callTimes: Record<string, Record<SupportedFlavor, number>> = {
        initial: { javascript: 2, react: 4, vue: 0 },
        refined: { javascript: 1, react: 2, vue: 0 },
      };

      expect(searchClient.search).toHaveBeenCalledTimes(
        callTimes.initial[flavor]
      );
      expect(searchClient.search).toHaveBeenNthCalledWith(
        callTimes.initial[flavor] - 1,
        [
          {
            indexName: 'query_suggestions',
            params: expect.objectContaining({
              query: '',
            }),
          },
        ]
      );
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

      expect(searchClient.search).toHaveBeenCalledTimes(
        callTimes.refined[flavor]
      );
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
            showSuggestions: {
              indexName: 'query_suggestions',
            },
            showRecent: true,
          },
          react: {
            showSuggestions: {
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
        screen.getAllByText('hello')[0].click();
        await wait(0);
      });

      const recentSearches = document.querySelectorAll(
        '.ais-AutocompleteRecentSearchesItem'
      );
      expect(recentSearches).toHaveLength(1);
      expect(recentSearches[0]).toHaveTextContent('hello');

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
  });
}
