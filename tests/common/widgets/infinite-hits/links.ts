import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import type { InfiniteHitsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createLinksTests(
  setup: InfiniteHitsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('links', () => {
    test("a click on a link with modifier doesn't search", async () => {
      const delay = 100;
      const margin = 10;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(({ params }) =>
                  createSingleSearchResponse({
                    hits: Array.from(
                      { length: params.hitsPerPage || 20 },
                      (_, i) => ({
                        objectID: `${i}`,
                      })
                    ) as any[],
                  })
                )
              );
            }),
          }),
        },
        widgetParams: {},
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      const container = document.querySelector('.ais-InfiniteHits')!;

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
