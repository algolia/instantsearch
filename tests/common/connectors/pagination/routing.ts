import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';

import type { PaginationConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createRoutingTests(
  setup: PaginationConnectorSetup,
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
        const options: SetupOptions<PaginationConnectorSetup> = {
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
                  ...requests.map(({ params }) =>
                    createSingleSearchResponse({
                      page: params.page,
                      nbPages: 20,
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
            '[data-testid="Pagination-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({ indexName: { page: 11 } })
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
          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            router.createURL({ indexName: { page: 11 } })
          );
        }

        // Select a refinement
        {
          const secondPage = screen.getByTestId('Pagination-refine');
          await act(async () => {
            secondPage.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            router.createURL({ indexName: { page: 11 } })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
          });

          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            router.createURL({ indexName: { page: 11 } })
          );
        }

        // Unselect the refinement
        {
          const firstPage = screen.getByTestId('Pagination-refine');
          await act(async () => {
            firstPage.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            router.createURL({ indexName: { page: 11 } })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
            await wait(0);
          });

          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            router.createURL({ indexName: { page: 11 } })
          );
        }
      });
    });
  });
}
