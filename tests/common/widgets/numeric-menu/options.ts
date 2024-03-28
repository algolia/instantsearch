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

import type { NumericMenuWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { SearchResponse } from 'instantsearch.js';

function normalizeSnapshot(html: string) {
  // Each flavor has its own way to render the widget by default.
  // @MAJOR: Remove this once all flavors are aligned.
  return commonNormalizeSnapshot(html)
    .replace(/<div>(.*?)<\/div>/gs, '$1')
    .replace(/value=".*?"/gs, '')
    .replace(/checked=""/g, '');
}

export function createOptionsTests(
  setup: NumericMenuWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with props', async () => {
      const searchClient = createMockedSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'price',
          items: [
            { label: 'All' },
            { label: 'Less than 500$', end: 500 },
            { label: 'Between 500$ - 1000$', start: 500, end: 1000 },
            { label: 'More than 1000$', start: 1000 },
          ],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-NumericMenu')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-NumericMenu"
        >
          <ul
            class="ais-NumericMenu-list"
          >
            <li
              class="ais-NumericMenu-item ais-NumericMenu-item--selected"
            >
              <label
                class="ais-NumericMenu-label"
              >
                <input
                  class="ais-NumericMenu-radio"
                  name="price"
                  type="radio"
                />
                <span
                  class="ais-NumericMenu-labelText"
                >
                  All
                </span>
              </label>
            </li>
            <li
              class="ais-NumericMenu-item"
            >
              <label
                class="ais-NumericMenu-label"
              >
                <input
                  class="ais-NumericMenu-radio"
                  name="price"
                  type="radio"
                />
                <span
                  class="ais-NumericMenu-labelText"
                >
                  Less than 500$
                </span>
              </label>
            </li>
            <li
              class="ais-NumericMenu-item"
            >
              <label
                class="ais-NumericMenu-label"
              >
                <input
                  class="ais-NumericMenu-radio"
                  name="price"
                  type="radio"
                />
                <span
                  class="ais-NumericMenu-labelText"
                >
                  Between 500$ - 1000$
                </span>
              </label>
            </li>
            <li
              class="ais-NumericMenu-item"
            >
              <label
                class="ais-NumericMenu-label"
              >
                <input
                  class="ais-NumericMenu-radio"
                  name="price"
                  type="radio"
                />
                <span
                  class="ais-NumericMenu-labelText"
                >
                  More than 1000$
                </span>
              </label>
            </li>
          </ul>
        </div>
      `
      );
      expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    });

    test('renders transformed items', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'price',
          items: [
            { label: 'All' },
            { label: 'Less than 500$', end: 500 },
            { label: 'Between 500$ - 1000$', start: 500, end: 1000 },
            { label: 'More than 1000$', start: 1000 },
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
        [...document.querySelectorAll('.ais-NumericMenu-labelText')].map(
          (item) => item.textContent
        )
      ).toEqual([
        'ALL',
        'LESS THAN 500$',
        'BETWEEN 500$ - 1000$',
        'MORE THAN 1000$',
      ]);
    });

    test('refines on user action', async () => {
      const searchClient = createSearchClient({});

      const items = [
        { label: 'All' },
        { label: 'Less than 500$', end: 500 },
        { label: 'Between 500$ - 1000$', start: 500, end: 1000 },
        { label: 'More than 1000$', start: 1000 },
      ];

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'price',
          items,
        },
      });

      await act(async () => {
        await wait(0);
      });

      const [, firstOption, secondOption, thirdOption] = items.map((item) =>
        screen.getByRole('radio', { name: item.label })
      );

      userEvent.click(firstOption);

      await act(async () => {
        await wait(0);
      });

      expect(firstOption).toBeChecked();
      expect(
        document.querySelector('.ais-NumericMenu-item--selected')
      ).toContainElement(
        screen.getByRole('radio', {
          name: firstOption.closest('label')?.textContent!.trim(),
        })
      );
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({ numericFilters: ['price<=500'] }),
          }),
        ])
      );

      userEvent.click(secondOption);

      await act(async () => {
        await wait(0);
      });

      expect(secondOption).toBeChecked();
      expect(
        document.querySelector('.ais-NumericMenu-item--selected')
      ).toContainElement(
        screen.getByRole('radio', {
          name: secondOption.closest('label')?.textContent!.trim(),
        })
      );
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              numericFilters: ['price<=1000', 'price>=500'],
            }),
          }),
        ])
      );

      userEvent.click(thirdOption);

      await act(async () => {
        await wait(0);
      });

      expect(thirdOption).toBeChecked();
      expect(
        document.querySelector('.ais-NumericMenu-item--selected')
      ).toContainElement(
        screen.getByRole('radio', {
          name: thirdOption.closest('label')?.textContent!.trim(),
        })
      );
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              numericFilters: ['price>=1000'],
            }),
          }),
        ])
      );
    });
  });
}

function createMockedSearchClient(
  subset: Partial<SearchResponse<{ name: string; description: string }>> = {}
) {
  return createSearchClient({
    search: jest.fn((requests) => {
      return Promise.resolve(
        createMultiSearchResponse(
          ...requests.map((request) => {
            return createSingleSearchResponse<any>({
              index: request.indexName,
              query: request.params?.query,
              hits: [{ objectID: '1' }, { objectID: '2' }],
              ...subset,
            });
          })
        )
      );
    }),
  });
}
