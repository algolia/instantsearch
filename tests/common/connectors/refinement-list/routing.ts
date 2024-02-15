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

import type { RefinementListConnectorSetup } from '.';
import type { TestOptions, SetupOptions } from '../../common';

export function createRoutingTests(
  setup: RefinementListConnectorSetup,
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
        const attribute = 'brand';
        const router = history();
        const options: SetupOptions<RefinementListConnectorSetup> = {
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
            '[data-testid="RefinementList-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: {
                  refinementList: {
                    [attribute]: ['value'],
                  },
                },
              })
            );
          }
        }

        // Wait for initial results to populate widgets with data
        await act(async () => {
          await wait(margin + delay);
          await wait(0);
        });

        function updateRefinement(value: string) {
          const inputElement = screen.getByTestId(
            'RefinementList-refine-input'
          );
          userEvent.clear(inputElement);
          userEvent.type(inputElement, `${value}{Enter}`);
        }

        // Initial state, before interaction
        {
          expect(screen.getByTestId('RefinementList-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                refinementList: {
                  [attribute]: ['value'],
                },
              },
            })
          );
        }

        // Select a refinement
        {
          await act(async () => {
            updateRefinement('Apple');
            await wait(0);
            await wait(0);
          });

          // URL has changed immediately after the user interaction
          expect(screen.getByTestId('RefinementList-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                refinementList: {
                  [attribute]: ['Apple', 'value'],
                },
              },
            })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
          });

          expect(screen.getByTestId('RefinementList-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                refinementList: {
                  [attribute]: ['Apple', 'value'],
                },
              },
            })
          );
        }

        // Unselect the refinement
        {
          await act(async () => {
            updateRefinement('Apple');
            await wait(0);
            await wait(0);
          });

          // URL has changed immediately after the user interaction
          expect(screen.getByTestId('RefinementList-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                refinementList: {
                  [attribute]: ['value'],
                },
              },
            })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
            await wait(0);
          });

          expect(screen.getByTestId('RefinementList-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                refinementList: {
                  [attribute]: ['value'],
                },
              },
            })
          );
        }

        // Unselect the 'value' refinement
        {
          await act(async () => {
            updateRefinement('value');
            await wait(0);
            await wait(0);
          });

          // URL has changed immediately after the user interaction
          expect(screen.getByTestId('RefinementList-link')).toHaveAttribute(
            'href',
            router.createURL({})
          );
        }
      });

      test('works with unsafe "routeToState" implementation', async () => {
        const delay = 100;
        const attribute = 'brand';
        const router = history();
        const options: SetupOptions<RefinementListConnectorSetup> = {
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
                      refinementList: {
                        other: routeState.indexName?.refinementList?.other,
                        [attribute]:
                          routeState.indexName?.refinementList?.[attribute],
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
            '[data-testid="RefinementList-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: {
                  refinementList: {
                    [attribute]: ['value'],
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
