import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import type { NumericMenuWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createLinksTests(
  setup: NumericMenuWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('links', () => {
    test("a click on a link with modifier doesn't search", async () => {
      const delay = 100;
      const margin = 10;
      const attribute = 'price';
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
                        0: 100,
                        1: 200,
                      },
                    },
                    facets_stats: {
                      [attribute]: {
                        min: 0,
                        max: 200,
                        avg: 100,
                        sum: 300,
                      },
                    },
                  })
                )
              );
            }),
          }),
        },
        widgetParams: {
          attribute,
          items: [{ label: '>20', min: 20, default: true }],
        },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      const container = document.querySelector('.ais-NumericMenu')!;

      // Initial state, before interaction
      {
        expect(container.querySelectorAll('a')).toHaveLength(0);
        expect(
          options.instantSearchOptions.searchClient.search
        ).toHaveBeenCalledTimes(1);
      }
    });
  });
}
