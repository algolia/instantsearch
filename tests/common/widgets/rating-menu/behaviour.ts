import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { RatingMenuWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createBehaviourTests(
  setup: RatingMenuWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('behaviour', () => {
    test('handle refinement on click', async () => {
      const delay = 100;
      const margin = 10;
      const attribute = 'brand';
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attribute]: {
                        0: 3422,
                        1: 156,
                        2: 194,
                        3: 1622,
                        4: 13925,
                        5: 2150,
                      },
                    },
                    facets_stats: {
                      [attribute]: {
                        min: 1,
                        max: 5,
                        avg: 2,
                        sum: 71860,
                      },
                    },
                  })
                )
              );
            }),
          }),
        },
        widgetParams: { attribute },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        const items = document.querySelectorAll('.ais-RatingMenu-item');
        expect(items).toHaveLength(4);

        const selectedItems = document.querySelectorAll(
          '.ais-RatingMenu-item--selected'
        );
        expect(selectedItems).toHaveLength(0);
      }

      // Refine on click of link
      {
        const firstItem = document.querySelector<HTMLLIElement>(
          '.ais-RatingMenu-link'
        )!;

        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
        });

        const selectedItems = document.querySelectorAll(
          '.ais-RatingMenu-item--selected'
        );
        expect(selectedItems).toHaveLength(1);
        expect(
          selectedItems[0].querySelector('.ais-RatingMenu-link')
        ).toHaveAccessibleName(/4 & Up/i);
      }

      // Refine on click of icon
      {
        const firstItem = document.querySelector<HTMLLIElement>(
          '.ais-RatingMenu-starIcon'
        )!;

        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
        });

        const selectedItems = document.querySelectorAll(
          '.ais-RatingMenu-item--selected'
        );
        expect(selectedItems).toHaveLength(0);
      }
    });
  });
}
