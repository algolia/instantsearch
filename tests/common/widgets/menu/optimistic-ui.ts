import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import type { MenuSetup } from '.';
import { fakeAct } from '../../common';
import userEvent from '@testing-library/user-event';
import { getByRole } from '@testing-library/dom';

export function createOptimisticUiTests(setup: MenuSetup) {
  // @TODO: after helper is updated with https://github.com/algolia/algoliasearch-helper-js/pull/925, enable this test
  describe.skip('optimistic UI', () => {
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
                        Apple: 200,
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
        expect(env.container.querySelectorAll('.ais-Menu-item')).toHaveLength(
          2
        );
        expect(
          env.container.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(0);
      }

      // Select a refinement
      {
        const firstItem = getByRole(env.container, 'link', {
          name: 'Apple 200',
        });

        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        // @TODO: menu doesn't have any accessible way to determine if an item is selected, so we use the class name (https://github.com/algolia/instantsearch/issues/5187)
        expect(
          env.container.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
        });

        expect(
          env.container.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(1);
      }

      // Unselect the refinement
      {
        const firstItem = getByRole(env.container, 'link', {
          name: 'Apple 200',
        });

        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(
          env.container.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(0);
      }

      // Wait for new results to come in
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
