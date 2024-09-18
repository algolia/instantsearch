import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { castToJestMock, wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { PoweredByWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createLinksTests(
  setup: PoweredByWidgetSetup,
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
                ...requests.map(() => createSingleSearchResponse({}))
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

      const container = document.querySelector('.ais-PoweredBy')!;

      const basePoweredBySearches =
        // Vue: 0, React, JS: 1
        castToJestMock(options.instantSearchOptions.searchClient.search).mock
          .calls.length;

      // Initial state, before interaction
      {
        expect(container.querySelectorAll('a')).toHaveLength(1);
        expect(
          options.instantSearchOptions.searchClient.search
        ).toHaveBeenCalledTimes(basePoweredBySearches);
      }

      // Click all links with a modifier
      {
        await act(async () => {
          container.querySelectorAll('a').forEach((link) => {
            userEvent.click(link, { ctrlKey: true });
          });

          await wait(0);
          await wait(0);
        });

        // No UI has changed
        expect(container.querySelectorAll('a')).toHaveLength(1);
        expect(
          options.instantSearchOptions.searchClient.search
        ).toHaveBeenCalledTimes(basePoweredBySearches);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
        });

        expect(container.querySelectorAll('a')).toHaveLength(1);
        expect(
          options.instantSearchOptions.searchClient.search
        ).toHaveBeenCalledTimes(basePoweredBySearches);
      }
    });
  });
}
