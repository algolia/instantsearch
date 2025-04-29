import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';

import type { RatingMenuConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createRoutingTests(
  setup: RatingMenuConnectorSetup,
  { act }: Required<TestOptions>
) {
  describe('routing', () => {
    beforeAll(() => {
      window.history.pushState({}, '', 'http://localhost/');
    });
    afterAll(() => {
      window.history.pushState({}, '', 'http://localhost/');
    });

    describe('URLs created by widget', () => {
      test('Consistently shows the right URL, even before widget is initialized', async () => {
        const delay = 100;
        const margin = 10;
        const router = history();
        const attribute = 'rating';
        const options: SetupOptions<RatingMenuConnectorSetup> = {
          instantSearchOptions: {
            indexName: 'indexName',
            routing: {
              stateMapping: simple(),
              router,
            },
            searchClient: createSearchClient({
              search: jest.fn(async (requests) => {
                await wait(delay);
                return createMultiSearchResponse(
                  ...requests.map(() =>
                    createSingleSearchResponse({
                      facets: {
                        [attribute]: {
                          5: 4,
                          4: 6,
                          3: 2,
                          2: 1,
                          1: 3,
                        },
                      },
                    })
                  )
                );
              }),
            }),
          },
          widgetParams: {
            attribute,
          },
        };

        await setup(options);

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="RatingMenu-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: { ratingMenu: { [attribute]: 5 } },
              })
            );
          }
        }

        // Wait for initial results to populate widgets with data
        await act(async () => {
          await wait(margin + delay);
          await wait(0);
        });

        // Initial state
        {
          expect(screen.getByTestId('RatingMenu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { ratingMenu: { [attribute]: 5 } },
            })
          );
        }

        // Select a refinement
        {
          const refineButton = screen.getByTestId('RatingMenu-refine');
          await act(async () => {
            userEvent.click(refineButton);
            await wait(margin + delay);
            await wait(0);
          });

          expect(screen.getByTestId('RatingMenu-link')).toHaveAttribute(
            'href',
            router.createURL({})
          );
        }

        // Deselect a refinement
        {
          const refineButton = screen.getByTestId('RatingMenu-refine');
          await act(async () => {
            userEvent.click(refineButton);
            await wait(margin + delay);
            await wait(0);
          });

          expect(screen.getByTestId('RatingMenu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { ratingMenu: { [attribute]: 5 } },
            })
          );
        }
      });

      test('works with unsafe "routeToState" implementation', async () => {
        const delay = 100;
        const attribute = 'free_shipping';
        const router = history();
        const options: SetupOptions<RatingMenuConnectorSetup> = {
          instantSearchOptions: {
            indexName: 'indexName',
            routing: {
              stateMapping: {
                stateToRoute(uiState) {
                  return uiState;
                },
                routeToState(routeState) {
                  return {
                    ...routeState,
                    indexName: {
                      ratingMenu: {
                        other: routeState.indexName?.ratingMenu?.other,
                        [attribute]:
                          routeState.indexName?.ratingMenu?.[attribute],
                      },
                    },
                  };
                },
              },
              router,
            },
            searchClient: createSearchClient({
              search: jest.fn(async (requests) => {
                await wait(delay);
                return createMultiSearchResponse(
                  ...requests.map(() =>
                    createSingleSearchResponse({
                      facets: {
                        [attribute]: {
                          5: 4,
                          4: 6,
                          3: 2,
                          2: 1,
                          1: 3,
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

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="RatingMenu-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: {
                  ratingMenu: {
                    [attribute]: 5,
                  },
                },
              })
            );
          }
        }
      });
    });
  });
}
