import { createSearchClient } from '@instantsearch/mocks';
import { normalizeSnapshot, wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { SortByWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: SortByWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with props', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: {
          items: [
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-SortBy-select')).toHaveValue(
        'instant_search'
      );

      expect(
        document.querySelector('.ais-SortBy')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-SortBy"
        >
          <select
            aria-label="Sort results by"
            class="ais-SortBy-select"
          >
            <option
              class="ais-SortBy-option"
              value="instant_search"
            >
              Featured
            </option>
            <option
              class="ais-SortBy-option"
              value="instant_search_price_asc"
            >
              Price (asc)
            </option>
            <option
              class="ais-SortBy-option"
              value="instant_search_price_desc"
            >
              Price (desc)
            </option>
          </select>
        </div>
      `
      );
    });

    test('transform the passed items', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: {
          items: [
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ],
          transformItems(items) {
            return items.map((item) => ({
              ...item,
              label: item.label.toUpperCase(),
            }));
          },
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-SortBy')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-SortBy"
        >
          <select
            aria-label="Sort results by"
            class="ais-SortBy-select"
          >
            <option
              class="ais-SortBy-option"
              value="instant_search"
            >
              FEATURED
            </option>
            <option
              class="ais-SortBy-option"
              value="instant_search_price_asc"
            >
              PRICE (ASC)
            </option>
            <option
              class="ais-SortBy-option"
              value="instant_search_price_desc"
            >
              PRICE (DESC)
            </option>
          </select>
        </div>
      `
      );
    });

    test('updates the selected index', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'instant_search',
          searchClient,
        },
        widgetParams: {
          items: [
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
          ],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ indexName: 'instant_search' }),
        ])
      );

      userEvent.selectOptions(
        document.querySelector('.ais-SortBy-select') as HTMLSelectElement,
        screen.getByRole('option', { name: 'Price (asc)' })
      );

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-SortBy-select')).toHaveValue(
        'instant_search_price_asc'
      );
      expect(searchClient.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ indexName: 'instant_search_price_asc' }),
        ])
      );
    });
  });
}
