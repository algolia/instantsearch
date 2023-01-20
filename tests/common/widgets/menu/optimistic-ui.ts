import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import type { MenuSetup } from '.';
import { fakeAct } from '../../common';
import userEvent from '@testing-library/user-event';

export function createOptimisticUiTests(setup: MenuSetup) {
  // @TODO: after helper is updated with https://github.com/algolia/algoliasearch-helper-js/pull/925, enable this test
  describe.skip('optimistic UI', () => {
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
        expect(env.container.querySelectorAll('.ais-Menu-item')).toHaveLength(
          2
        );
        expect(
          env.container.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(0);
      }

      // select item
      {
        const firstItem = env.container.querySelector('.ais-Menu-link')!;
        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
          await wait(0);
        });

        // immediately after interaction
        expect(
          env.container.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(1);
      }

      // after result comes in
      {
        await act(async () => {
          await wait(delay + margin);
        });

        expect(
          env.container.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(1);
      }

      // unselect item
      {
        const firstItem = env.container.querySelector('.ais-Menu-link')!;
        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
          await wait(0);
        });

        // immediately after interaction
        expect(
          env.container.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(0);
      }

      // after result comes in
      {
        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        expect(
          env.container.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(0);
      }
    });
  });
}
