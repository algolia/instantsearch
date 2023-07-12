import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { screen } from '@testing-library/dom';
import type { HierarchicalMenuConnectorSetup } from '.';
import type { Act } from '../../common';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import { history } from 'instantsearch.js/es/lib/routers';

export function createRoutingTests(
  setup: HierarchicalMenuConnectorSetup,
  act: Act
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
        const attributes = ['1', '2'];
        const router = history();
        const options = {
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

        await setup(options);

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="HierarchicalMenu-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: { hierarchicalMenu: { [attributes[0]]: ['value'] } },
              })
            );
          }
        }

        // Wait for initial results to populate widgets with data
        await act(async () => {
          await wait(margin + delay);
          await wait(0);
        });

        // Initial state, before interaction
        {
          expect(screen.getByTestId('HierarchicalMenu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { hierarchicalMenu: { [attributes[0]]: ['value'] } },
            })
          );
        }

        // Select a refinement
        {
          const apple = screen.getByTestId('HierarchicalMenu-refine');
          await act(async () => {
            apple.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('HierarchicalMenu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { hierarchicalMenu: { [attributes[0]]: ['value'] } },
            })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
          });

          expect(screen.getByTestId('HierarchicalMenu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                hierarchicalMenu: { [attributes[0]]: ['value'] },
              },
            })
          );
        }

        // Unselect the refinement
        {
          const apple = screen.getByTestId('HierarchicalMenu-refine');
          await act(async () => {
            apple.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('HierarchicalMenu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { hierarchicalMenu: { [attributes[0]]: ['value'] } },
            })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
            await wait(0);
          });

          expect(screen.getByTestId('HierarchicalMenu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { hierarchicalMenu: { [attributes[0]]: ['value'] } },
            })
          );
        }
      });
    });
  });
}
