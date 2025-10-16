import {
  createAlgoliaSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { normalizeSnapshot, wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { AutocompleteWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: AutocompleteWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    it.only('renders the autocomplete with a single index', async () => {
      const searchClient = createAlgoliaSearchClient({
        search: jest.fn((requests) =>
          Promise.resolve(
            createMultiSearchResponse(
              ...requests.map(() =>
                createSingleSearchResponse({
                  index: 'instant_search',
                  hits: [
                    { objectID: '1', name: 'Product 1' },
                    { objectID: '2', name: 'Product 2' },
                  ],
                  nbHits: 2,
                })
              )
            )
          )
        ),
      });

      await setup({
        widgetParams: {
          indices: [
            {
              indexName: 'instant_search',
              templates: {
                item: ({ item }, { html, components }) =>
                  html`${components.ReverseHighlight({
                    attribute: 'name',
                    hit: item,
                  })}`,
              },
            },
          ],
        },
        instantSearchOptions: {
          searchClient,
        },
      });

      const container = document.querySelector('.ais-Autocomplete')!;
      const panel = container.querySelector('.ais-Autocomplete-panel')!;

      await act(() => wait(0));
      await act(() => wait(0));

      expect(normalizeSnapshot(panel.innerHTML)).toMatchInlineSnapshot(`
        <div>
          <ol>
          </ol>
        </div>
      `);

      expect(searchClient.search).toHaveBeenCalledTimes(0);

      await userEvent.type(screen.getByRole('searchbox'), 'p');
      await act(() => wait(0));

      expect(searchClient.search).toHaveBeenCalledTimes(1);

      expect(
        normalizeSnapshot(
          document.querySelector('.ais-Autocomplete-panel')!.innerHTML
        )
      ).toMatchInlineSnapshot(`
        <div>
          <ol>
          </ol>
        </div>
      `);
    });

    it('renders the autocomplete with multiple indices', async () => {
      await setup({
        widgetParams: {
          indices: [
            { indexName: 'instant_search' },
            { indexName: 'instant_search_price_asc' },
          ],
        },
        instantSearchOptions: {
          searchClient: createAlgoliaSearchClient({
            search: jest
              .fn()
              .mockResolvedValueOnce(
                createMultiSearchResponse(
                  createSingleSearchResponse({
                    index: 'instant_search',
                    hits: [
                      { objectID: '1', name: 'Product 1' },
                      { objectID: '2', name: 'Product 2' },
                    ],
                    nbHits: 2,
                  }),
                  createSingleSearchResponse({
                    index: 'instant_search_price_asc',
                    hits: [{ objectID: '3', name: 'Product 3' }],
                    nbHits: 1,
                  })
                )
              )
              .mockResolvedValue(
                createMultiSearchResponse(
                  createSingleSearchResponse({
                    index: 'instant_search',
                    hits: [],
                    nbHits: 0,
                  }),
                  createSingleSearchResponse({
                    index: 'instant_search_price_asc',
                    hits: [],
                    nbHits: 0,
                  })
                )
              ),
          }),
        },
      });

      const container = document.querySelector('.ais-Autocomplete')!;
      const panel = container.querySelector('.ais-Autocomplete-panel')!;

      await act(() => wait(0));
      expect(normalizeSnapshot(panel.innerHTML)).toMatchInlineSnapshot(`
        <div>
          <ol>
          </ol>
        </div>
        <div>
          <ol>
          </ol>
        </div>
      `);

      await userEvent.type(screen.getByRole('searchbox'), 'Pro');
      await act(() => wait(0));
      expect(normalizeSnapshot(panel.innerHTML)).toMatchInlineSnapshot(`
        <div>
          <ol>
          </ol>
        </div>
        <div>
          <ol>
          </ol>
        </div>
      `);
    });
  });
}
