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

      await act(async () => {
        const input = document.querySelector(
          '.ais-SearchBox-input'
        ) as HTMLInputElement;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await wait(0);
      });

      const indicesItems = document.querySelectorAll(
        '.ais-AutocompleteIndexItem'
      );
      expect(indicesItems).toHaveLength(2);
      expect(indicesItems[0]).toHaveTextContent('Item 1');
      expect(indicesItems[1]).toHaveTextContent('hello');
    });
  });
}
