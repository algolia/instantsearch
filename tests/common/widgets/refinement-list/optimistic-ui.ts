import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import type { RefinementListSetup } from '.';
import { fakeAct } from '../../common';

export function createOptimisticUiTests(setup: RefinementListSetup) {
  describe('optimistic UI', () => {
    test('checks the clicked refinement immediately regardless of network latency', async () => {
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
                        Samsung: 100,
                        Apple: 1000,
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
      const env = await setup(options);
      const { act = fakeAct } = env;

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // before interaction
      {
        expect(
          env.container.querySelectorAll('.ais-RefinementList-item')
        ).toHaveLength(2);
        expect(
          env.container.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(0);
      }

      // Select a page
      {
        const firstItem = env.container.querySelector<HTMLInputElement>(
          '.ais-RefinementList-checkbox'
        )!;
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(firstItem).toBeChecked();
        expect(
          env.container.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        const firstItem = env.container.querySelector<HTMLInputElement>(
          '.ais-RefinementList-checkbox'
        )!;

        await act(async () => {
          await wait(delay + margin);
        });

        expect(firstItem).toBeChecked();
        expect(
          env.container.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(1);
      }

      // Select the next page
      {
        const firstItem = env.container.querySelector<HTMLInputElement>(
          '.ais-RefinementList-checkbox'
        )!;
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(firstItem).not.toBeChecked();
        expect(
          env.container.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(0);
      }

      // Wait for new results to come in
      {
        const firstItem = env.container.querySelector<HTMLInputElement>(
          '.ais-RefinementList-checkbox'
        )!;

        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        expect(firstItem).not.toBeChecked();
        expect(
          env.container.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(0);
      }
    });
  });
}
