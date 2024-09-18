import { createSearchClient } from '@instantsearch/mocks';
import { castToJestMock, wait } from '@instantsearch/testutils';

import type { DynamicWidgetsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createLinksTests(
  setup: DynamicWidgetsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('links', () => {
    test("a click on a link with modifier doesn't search", async () => {
      const delay = 100;
      const margin = 10;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
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

      const container = document.querySelector('.ais-DynamicWidgets')!;

      const baseDynamicWidgetsSearches =
        // Vue: 2, React, JS: 1
        castToJestMock(options.instantSearchOptions.searchClient.search).mock
          .calls.length;

      // Initial state, before interaction
      {
        expect(container.querySelectorAll('a')).toHaveLength(0);
        expect(
          options.instantSearchOptions.searchClient.search
        ).toHaveBeenCalledTimes(baseDynamicWidgetsSearches);
      }
    });
  });
}
