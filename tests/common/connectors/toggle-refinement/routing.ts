import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { screen } from '@testing-library/dom';
import type { ToggleRefinementConnectorSetup } from '.';
import type { Act } from '../../common';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import { history } from 'instantsearch.js/es/lib/routers';

export function createRoutingTests(
  setup: ToggleRefinementConnectorSetup,
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
        const router = history();
        const attribute = 'free_shipping';
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
    });
  });
}
