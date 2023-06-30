import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { screen } from '@testing-library/dom';
import type { CurrentRefinementsSetup } from '.';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import { history } from 'instantsearch.js/es/lib/routers';
import type { Act } from '../../common';

export function createRoutingTests(setup: CurrentRefinementsSetup, act: Act) {
  describe('routing', () => {
    describe('URLs created by widget', () => {
      test('Consistently shows the right URL, even before widget is initialized', async () => {
        const delay = 100;
        const margin = 10;
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
                      facets: { brand: { Apple: 200 } },
                    })
                  )
                );
              }),
            }),
          },
          widgetParams: {},
        };

        await setup(options);

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="CurrentRefinements-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute('href', router.createURL({}));
          }
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
          });

          expect(screen.getByTestId('CurrentRefinements-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {},
            })
          );
        }

        // Select the refinement
        {
          const apple = screen.getByRole('checkbox', { name: 'Apple 200' });
          await act(async () => {
            apple.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('CurrentRefinements-link')).toHaveAttribute(
            'href',
            router.createURL({})
          );
        }

        // Unselect the refinement
        {
          const apple = screen.getByRole('checkbox', { name: 'Apple 200' });
          await act(async () => {
            apple.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('CurrentRefinements-link')).toHaveAttribute(
            'href',
            router.createURL({})
          );
        }
      });
    });
  });
}
