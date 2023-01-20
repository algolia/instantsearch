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
    test('is checked immediately with a slow network', async () => {
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

      // wait for initial results
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

      // select item
      {
        const firstItem = env.container.querySelector<HTMLInputElement>(
          '.ais-RefinementList-checkbox'
        )!;
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // immediately after interaction
        expect(firstItem).toBeChecked();
        expect(
          env.container.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(1);
      }

      // after result comes in
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

      // unselect item
      {
        const firstItem = env.container.querySelector<HTMLInputElement>(
          '.ais-RefinementList-checkbox'
        )!;
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // immediately after interaction
        expect(firstItem).not.toBeChecked();
        expect(
          env.container.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(0);
      }

      // after result comes in
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
