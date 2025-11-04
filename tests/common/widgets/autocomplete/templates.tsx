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

export function createTemplatesTests(
  setup: AutocompleteWidgetSetup,
  { act, flavor }: Required<TestOptions>
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

        // JS currently doesn't refine on focus
        const input = screen.getByRole('combobox', {
          name: /submit/i,
        });
        userEvent.click(input);
        userEvent.type(input, 'a');
        userEvent.clear(input);

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
