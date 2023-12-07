import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';

import type { ToggleRefinementConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createRoutingTests(
  setup: ToggleRefinementConnectorSetup,
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
        const attribute = 'free_shipping';
        const options: SetupOptions<ToggleRefinementConnectorSetup> = {
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
                      facets: { [attribute]: { true: 400 } },
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
            '[data-testid="ToggleRefinement-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: { toggle: { [attribute]: true } },
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
          expect(screen.getByTestId('ToggleRefinement-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { toggle: { [attribute]: true } },
            })
          );
        }

        // Toggle the widget
        {
          const toggle = screen.getByTestId('ToggleRefinement-refine');
          await act(async () => {
            toggle.click();
            await wait(0);
            await wait(0);
          });

          // URL is different after toggle
          expect(screen.getByTestId('ToggleRefinement-link')).toHaveAttribute(
            'href',
            router.createURL({})
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
          });

          expect(screen.getByTestId('ToggleRefinement-link')).toHaveAttribute(
            'href',
            router.createURL({})
          );
        }

        // Unselect the refinement
        {
          const toggle = screen.getByTestId('ToggleRefinement-refine');
          await act(async () => {
            toggle.click();
            await wait(0);
            await wait(0);
          });

          // URL goes back to previous value
          expect(screen.getByTestId('ToggleRefinement-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { toggle: { [attribute]: true } },
            })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
            await wait(0);
          });

          expect(screen.getByTestId('ToggleRefinement-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { toggle: { [attribute]: true } },
            })
          );
        }
      });

      test('works with unsafe "routeToState" implementation', async () => {
        const delay = 100;
        const attribute = 'free_shipping';
        const router = history();
        const options: SetupOptions<ToggleRefinementConnectorSetup> = {
          instantSearchOptions: {
            indexName: 'indexName',
            routing: {
              stateMapping: {
                stateToRoute(uiState) {
                  return uiState;
                },
                // @ts-expect-error returning undefined instead of real UiState for attribute keys
                routeToState(routeState) {
                  return {
                    ...routeState,
                    indexName: {
                      toggle: {
                        other: routeState.indexName?.toggle?.other,
                        [attribute]: routeState.indexName?.toggle?.[attribute],
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

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="ToggleRefinement-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: {
                  toggle: {
                    [attribute]: true,
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
