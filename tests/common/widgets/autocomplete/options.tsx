import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

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
  { act }: Required<TestOptions>
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
                  item: (props) => props.item.query,
                },
              },
              {
                indexName: 'indexName2',
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
      expect(
        document.querySelector('.ais-SearchBox-input')
      ).toBeInTheDocument();
      expect(
        document.querySelector('.ais-SearchBox-loadingIndicator')
      ).toHaveAttribute('hidden');
      expect(
        document.querySelector('.ais-AutocompletePanel')
      ).toBeInTheDocument();
      expect(document.querySelectorAll('.ais-AutocompleteIndex')).toHaveLength(
        2
      );

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

      expect(searchClient.search).toHaveBeenCalledTimes(4);
      expect(searchClient.search).toHaveBeenNthCalledWith(3, [
        {
          indexName: 'query_suggestions',
          params: expect.objectContaining({
            query: '',
          }),
        },
      ]);
      (searchClient.search as jest.Mock).mockClear();

      expect(
        document.querySelectorAll('.ais-AutocompleteSuggestion')
      ).toHaveLength(2);
      expect(
        document.querySelectorAll('.ais-AutocompleteSuggestion')[0]
      ).toHaveTextContent('hello');
      expect(
        document.querySelectorAll('.ais-AutocompleteSuggestion')[1]
      ).toHaveTextContent('hi');

      // click the hello combo box suggestion
      await act(async () => {
        (
          document.querySelectorAll(
            '.ais-AutocompleteSuggestion'
          )[0] as HTMLElement
        ).click();
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
                  item: (props) => props.item.query,
                },
              },
              {
                indexName: 'indexName2',
                templates: {
                  item: (props) => props.item.name,
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

      const input = document.querySelector(
        '.ais-SearchBox-input'
      ) as HTMLInputElement;

      await act(async () => {
        input.click();
        await wait(0);

        const downArrowEvent = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
        });
        input.dispatchEvent(downArrowEvent);

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
        const upArrowEvent1 = new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true,
        });
        input.dispatchEvent(upArrowEvent1);
        await wait(0);

        const upArrowEvent2 = new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true,
        });
        input.dispatchEvent(upArrowEvent2);
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
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
        });
        input.dispatchEvent(enterEvent);

        await wait(0);
      });

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          item: expect.objectContaining({ objectID: '1', query: 'hello' }),
        })
      );
    });
  });
}
