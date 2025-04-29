import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';

import { skippableDescribe } from '../../common';

import type { CurrentRefinementsConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createRoutingTests(
  setup: CurrentRefinementsConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('routing', skippedTests, () => {
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
        const options: SetupOptions<CurrentRefinementsConnectorSetup> = {
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
          const apple = screen.getByTestId('CurrentRefinements-refine');
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
          const apple = screen.getByTestId('CurrentRefinements-refine');
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

      test('Consistently shows the right URL, even with initial URL', async () => {
        const delay = 100;
        const margin = 10;
        const router = history();
        const options: SetupOptions<CurrentRefinementsConnectorSetup> = {
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
                      facets: { brand: { Apple: 200, Samsung: 100 } },
                    })
                  )
                );
              }),
            }),
          },
          widgetParams: {},
        };

        window.history.pushState(
          {},
          '',
          router.createURL({
            indexName: { refinementList: { brand: ['Apple'] } },
          })
        );

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
            router.createURL({})
          );
        }

        // Select the refinement
        {
          const samsung = screen.getByRole('checkbox', { name: 'Samsung 100' });
          await act(async () => {
            samsung.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('CurrentRefinements-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { refinementList: { brand: ['Samsung'] } },
            })
          );
        }

        // Unselect the refinement
        {
          const samsung = screen.getByRole('checkbox', { name: 'Samsung 100' });
          await act(async () => {
            samsung.click();
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
