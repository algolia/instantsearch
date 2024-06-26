import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';

import type { BreadcrumbConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createRoutingTests(
  setup: BreadcrumbConnectorSetup,
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
        const attributes = ['one', 'two'];

        const router = history();
        const options: SetupOptions<BreadcrumbConnectorSetup> = {
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

        window.history.pushState(
          {},
          '',
          router.createURL({
            indexName: {
              hierarchicalMenu: {
                one: ['Apple', 'iPhone'],
              },
            },
          })
        );

        await setup(options);

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="Breadcrumb-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: {
                  hierarchicalMenu: {
                    one: ['Apple'],
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

        // Initial state, before interaction, URL toggles the last section
        {
          expect(screen.getByTestId('Breadcrumb-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                hierarchicalMenu: {
                  one: ['Apple'],
                },
              },
            })
          );
        }

        // Select a refinement
        {
          const firstItem = screen.getByTestId('Breadcrumb-refine');
          await act(async () => {
            firstItem.click();
            await wait(0);
            await wait(0);
          });

          // URL now includes "iPhone" as it is no longer refined
          expect(screen.getByTestId('Breadcrumb-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                hierarchicalMenu: {
                  one: ['Apple', 'iPhone'],
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

          expect(screen.getByTestId('Breadcrumb-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                hierarchicalMenu: {
                  one: ['Apple', 'iPhone'],
                },
              },
            })
          );
        }
      });

      test('works with unsafe "routeToState" implementation', async () => {
        const delay = 100;
        const attributes = ['brand'];
        const router = history();
        const options: SetupOptions<BreadcrumbConnectorSetup> = {
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
                      hierarchicalMenu: {
                        other: routeState.indexName?.hierarchicalMenu?.other,
                        [attributes[0]]:
                          routeState.indexName?.hierarchicalMenu?.[
                            attributes[0]
                          ],
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
                        [attributes[0]]: {
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
          widgetParams: { attributes },
        };

        await setup(options);

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="Breadcrumb-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: {
                  hierarchicalMenu: {
                    [attributes[0]]: ['Apple', 'iPhone'],
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
