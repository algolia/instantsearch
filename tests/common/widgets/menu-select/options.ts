import {
  createAlgoliaSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { MenuSelectWidgetSetup } from '.';
import type { TestOptions } from '../../common';

function normalizeSnapshot(html: string) {
  return (
    commonNormalizeSnapshot(html)
      // With Vue it puts whitespace around option label, we should remove it
      .replace(/>\s+(.*)\s+</g, '>$1<')
      // Also, Vue puts whitespace between option tags
      .replace(/<\/option>\s*<option/, '</option><option')
  );
}

export function createOptionsTests(
  setup: MenuSelectWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    const searchClient = createAlgoliaSearchClient({
      search: jest.fn((requests) => {
        return Promise.resolve(
          createMultiSearchResponse(
            ...requests.map(() =>
              createSingleSearchResponse({
                facets: {
                  brand: {
                    'Insignia™': 746,
                    Samsung: 633,
                    Metra: 591,
                    HP: 530,
                  },
                },
              })
            )
          )
        );
      }),
    });

    beforeEach(() => {
      searchClient.search.mockClear();
    });

    test('renders with props', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'brand',
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByRole('combobox')).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <select
          class="ais-MenuSelect-select"
        >
          <option
            class="ais-MenuSelect-option"
            value=""
          >
            See all
          </option>
          <option
            class="ais-MenuSelect-option"
            value="HP"
          >
            HP (530)
          </option>
          <option
            class="ais-MenuSelect-option"
            value="Insignia™"
          >
            Insignia™ (746)
          </option>
          <option
            class="ais-MenuSelect-option"
            value="Metra"
          >
            Metra (591)
          </option>
          <option
            class="ais-MenuSelect-option"
            value="Samsung"
          >
            Samsung (633)
          </option>
        </select>
      `
      );
    });

    test('limits the number of items to display', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'brand',
          limit: 2,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    test('transforms the items', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'brand',
          transformItems: (items) =>
            items.map((item) => ({
              ...item,
              label: item.label.toUpperCase(),
            })),
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        screen.getByRole('option', {
          name: 'HP (530)',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: 'INSIGNIA™ (746)',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: 'METRA (591)',
        })
      ).toBeInTheDocument();
    });

    test('refines on user action', async () => {
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'brand',
        },
      });

      await act(async () => {
        await wait(0);
      });

      await act(async () => {
        userEvent.selectOptions(screen.getByRole('combobox'), 'HP');
        await wait(0);
      });

      // Once on load, once on check.
      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              facetFilters: [['brand:HP']],
            }),
          }),
        ])
      );
    });

    describe('sorting', () => {
      test('sorts the items by ascending name', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            sortBy: ['name:asc'],
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          screen.getAllByRole('option').map((item) => item.textContent?.trim())
        ).toEqual([
          'See all',
          'HP (530)',
          'Insignia™ (746)',
          'Metra (591)',
          'Samsung (633)',
        ]);
      });

      test('sorts the items by descending name', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            sortBy: ['name:desc'],
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          screen.getAllByRole('option').map((item) => item.textContent?.trim())
        ).toEqual([
          'See all',
          'Samsung (633)',
          'Metra (591)',
          'Insignia™ (746)',
          'HP (530)',
        ]);
      });

      test('sorts the items by count', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            sortBy: ['count'],
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          screen.getAllByRole('option').map((item) => item.textContent?.trim())
        ).toEqual([
          'See all',
          'Insignia™ (746)',
          'Samsung (633)',
          'Metra (591)',
          'HP (530)',
        ]);
      });

      test('sorts the items by refinement state', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            sortBy: ['isRefined', 'name'],
            transformItems: (items) =>
              items.map((item) => ({
                ...item,
                label: `${item.label} ${item.isRefined ? 'y' : 'n'}`,
              })),
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          screen.getAllByRole('option').map((item) => item.textContent?.trim())
        ).toEqual([
          'See all',
          'HP n (530)',
          'Insignia™ n (746)',
          'Metra n (591)',
          'Samsung n (633)',
        ]);

        await act(async () => {
          userEvent.selectOptions(screen.getByRole('combobox'), 'Samsung');
          await wait(0);
        });

        expect(
          screen.getAllByRole('option').map((item) => item.textContent?.trim())
        ).toEqual([
          'See all',
          'Samsung y (633)',
          'HP n (530)',
          'Insignia™ n (746)',
          'Metra n (591)',
        ]);
      });

      test('sorts the items using a sorting function', async () => {
        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            attribute: 'brand',
            sortBy: (a, b) => b.name.localeCompare(a.name),
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          screen.getAllByRole('option').map((item) => item.textContent?.trim())
        ).toEqual([
          'See all',
          'Samsung (633)',
          'Metra (591)',
          'Insignia™ (746)',
          'HP (530)',
        ]);
      });
    });
  });
}
