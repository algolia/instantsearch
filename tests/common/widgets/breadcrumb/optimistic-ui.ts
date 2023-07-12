import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import type { BreadcrumbWidgetSetup } from '.';
import type { Act } from '../../common';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/dom';

export function createOptimisticUiTests(
  setup: BreadcrumbWidgetSetup,
  act: Act
) {
  describe('optimistic UI', () => {
    test('checks the clicked refinement immediately regardless of network latency', async () => {
      const delay = 100;
      const margin = 10;
      const attributes = ['1', '2'];
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              hierarchicalMenu: {
                [attributes[0]]: ['Apple > iPhone'],
              },
            },
          },
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attributes[0]]: {
                        Samsung: 100,
                        Apple: 200,
                      },
                      [attributes[1]]: {
                        'Apple > iPad': 100,
                        'Apple > iPhone': 100,
                      },
                    },
                  })
                )
              );
            }),
          }),
        },
        widgetParams: { attributes },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        expect(document.querySelectorAll('.ais-Breadcrumb-item')).toHaveLength(
          3
        );
        expect(
          document.querySelectorAll('.ais-Breadcrumb-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-Breadcrumb-item--selected')
        ).toHaveTextContent(/> ?iPhone/);
      }

      // Select a refinement
      {
        const firstItem = screen.getByRole('link', {
          name: 'Apple',
        });
        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        // @TODO: menu doesn't have any accessible way to determine if an item is selected, so we use the class name (https://github.com/algolia/instantsearch/issues/5187)
        expect(
          document.querySelectorAll('.ais-Breadcrumb-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-Breadcrumb-item--selected')
        ).toHaveTextContent(/> ?Apple/);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
        });

        expect(
          document.querySelectorAll('.ais-Breadcrumb-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-Breadcrumb-item--selected')
        ).toHaveTextContent(/> ?Apple/);
      }
    });

    test('reverts back to previous state on error', async () => {
      const delay = 100;
      const margin = 10;
      const attributes = ['1', '2'];
      let errors = false;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          initialUiState: {
            indexName: {
              hierarchicalMenu: {
                [attributes[0]]: ['Apple > iPhone'],
              },
            },
          },
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
                      [attributes[0]]: {
                        Samsung: 100,
                        Apple: 200,
                      },
                      [attributes[1]]: {
                        'Apple > iPad': 100,
                        'Apple > iPhone': 100,
                      },
                    },
                  })
                )
              );
            }),
          }),
        },
        widgetParams: { attributes },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        expect(document.querySelectorAll('.ais-Breadcrumb-item')).toHaveLength(
          3
        );
        expect(
          document.querySelectorAll('.ais-Breadcrumb-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-Breadcrumb-item--selected')
        ).toHaveTextContent(/> ?iPhone/);
      }

      // start erroring
      errors = true;

      // Select a refinement
      {
        const firstItem = screen.getByRole('link', {
          name: 'Apple',
        });
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(
          document.querySelectorAll('.ais-Breadcrumb-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-Breadcrumb-item--selected')
        ).toHaveTextContent(/> ?Apple/);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        // refinement has reverted back to previous state
        expect(
          document.querySelectorAll('.ais-Breadcrumb-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-Breadcrumb-item--selected')
        ).toHaveTextContent(/> ?iPhone/);
      }

      // stop erroring
      errors = false;

      // Select the refinement again
      {
        const firstItem = screen.getByRole('link', {
          name: 'Apple',
        });
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(
          document.querySelectorAll('.ais-Breadcrumb-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-Breadcrumb-item--selected')
        ).toHaveTextContent(/> ?Apple/);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        // refinement is consistent with clicks again
        expect(
          document.querySelectorAll('.ais-Breadcrumb-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-Breadcrumb-item--selected')
        ).toHaveTextContent(/> ?Apple/);
      }
    });
  });
}
