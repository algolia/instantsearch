import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import type { ClearRefinementsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createLinksTests(
  setup: ClearRefinementsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('links', () => {
    test("a click on a link with modifier doesn't search", async () => {
      const delay = 100;
      const margin = 10;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              refinementList: {
                brand: ['Apple'],
              },
            },
          },
          searchClient: createSearchClient({}),
        },
        widgetParams: {},
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      const container = document.querySelector('.ais-ClearRefinements')!;

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
