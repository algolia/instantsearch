import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import type { HitsPerPageWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createLinksTests(
  setup: HitsPerPageWidgetSetup,
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
            search: jest.fn(async () => {
              await wait(delay);
              return createMultiSearchResponse(createSingleSearchResponse());
            }),
          }),
        },
        widgetParams: {
          items: [
            { value: 10, label: 'ten', default: true },
            { value: 20, label: 'twenty' },
            { value: 30, label: 'thirty' },
          ],
        },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      const container = document.querySelector('.ais-HitsPerPage')!;

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
