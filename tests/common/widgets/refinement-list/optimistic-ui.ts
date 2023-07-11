import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { screen } from '@testing-library/dom';
import type { RefinementListWidgetSetup } from '.';
import type { Act } from '../../common';

export function createOptimisticUiTests(setup: RefinementListWidgetSetup, act: Act) {
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

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        expect(
          document.querySelectorAll('.ais-RefinementList-item')
        ).toHaveLength(2);
        expect(
          document.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(0);
      }

      // Select a refinement
      {
        const firstItem = screen.getByRole('checkbox', {
          name: 'Apple 200',
        });
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(firstItem).toBeChecked();
        expect(
          document.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        const firstItem = screen.getByRole('checkbox', {
          name: 'Apple 200',
        });

        await act(async () => {
          await wait(delay + margin);
        });

        expect(firstItem).toBeChecked();
        expect(
          document.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(1);
      }

      // Unselect the refinement
      {
        const firstItem = screen.getByRole('checkbox', {
          name: 'Apple 200',
        });
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(firstItem).not.toBeChecked();
        expect(
          document.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(0);
      }

      // Wait for new results to come in
      {
        const firstItem = screen.getByRole('checkbox', {
          name: 'Apple 200',
        });

        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        expect(firstItem).not.toBeChecked();
        expect(
          document.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(0);
      }
    });

    test('reverts back to previous state on error', async () => {
      const delay = 100;
      const margin = 10;
      const attribute = 'brand';
      let errors = false;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              if (errors) {
                throw new Error('Network error!');
              }
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

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        expect(
          document.querySelectorAll('.ais-RefinementList-item')
        ).toHaveLength(2);
        expect(
          document.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(0);
      }

      // start erroring
      errors = true;

      // Select a refinement
      {
        const firstItem = screen.getByRole('checkbox', {
          name: 'Apple 200',
        });
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(firstItem).toBeChecked();
        expect(
          document.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        const firstItem = screen.getByRole('checkbox', {
          name: 'Apple 200',
        });

        // refinement has reverted back to previous state
        expect(firstItem).not.toBeChecked();
        expect(
          document.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(0);
      }

      // stop erroring
      errors = false;

      // Select the refinement again
      {
        const firstItem = screen.getByRole('checkbox', {
          name: 'Apple 200',
        });
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(firstItem).toBeChecked();
        expect(
          document.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        // refinement is consistent with clicks again
        const firstItem = screen.getByRole('checkbox', {
          name: 'Apple 200',
        });

        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        expect(firstItem).toBeChecked();
        expect(
          document.querySelectorAll('.ais-RefinementList-item--selected')
        ).toHaveLength(1);
      }
    });
  });
}
