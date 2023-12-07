import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';

import type { NumericMenuConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createRoutingTests(
  setup: NumericMenuConnectorSetup,
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
        const attribute = 'price';
        const options: SetupOptions<NumericMenuConnectorSetup> = {
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
                  ...requests.map(() => createSingleSearchResponse({}))
                );
              }),
            }),
          },
          widgetParams: {
            attribute,
            items: [{ label: 'All' }, { label: 'Less than 500$', end: 500 }],
          },
        };

        await setup(options);

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="NumericMenu-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: { numericMenu: { [attribute]: '500:' } },
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
          expect(screen.getByTestId('NumericMenu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { numericMenu: { [attribute]: '500:' } },
            })
          );
        }
      });

      test('works with unsafe "routeToState" implementation', async () => {
        const delay = 100;
        const attribute = 'range';
        const router = history();
        const options: SetupOptions<NumericMenuConnectorSetup> = {
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
                      numericMenu: {
                        other: routeState.indexName?.numericMenu?.other,
                        [attribute]:
                          routeState.indexName?.numericMenu?.[attribute],
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
                  ...requests.map(() => createSingleSearchResponse({}))
                );
              }),
            }),
          },
          widgetParams: {
            attribute,
            items: [{ label: 'All' }, { label: 'Less than 500$', end: 500 }],
          },
        };

        await setup(options);

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="NumericMenu-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: {
                  numericMenu: {
                    [attribute]: '500:',
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
