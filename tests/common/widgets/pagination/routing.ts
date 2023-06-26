import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { screen } from '@testing-library/dom';
import type { PaginationSetup } from '.';
import type { Act } from '../../common';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import { history } from 'instantsearch.js/es/lib/routers';

export function createRoutingTests(setup: PaginationSetup, act: Act) {
  describe('routing', () => {
    describe('URLs created by widget', () => {
      test('Consistently shows the right URL, even before widget is initialized', async () => {
        const delay = 100;
        const margin = 10;
        const options = {
          instantSearchOptions: {
            indexName: 'indexName',
            routing: {
              stateMapping: simple(),
              routing: history(),
            },
            searchClient: createSearchClient({
              search: jest.fn(async (requests) => {
                await wait(delay);
                return createMultiSearchResponse(
                  ...requests.map(({ params }) =>
                    createSingleSearchResponse({
                      page: params!.page,
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
              `http://localhost/?${encodeURI('indexName[page]=10')}`
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
            `http://localhost/?${encodeURI('indexName[page]=10')}`
          );
        }

        // Select a refinement
        {
          const secondPage = screen.getByRole('link', { name: 'Page 2' });
          await act(async () => {
            secondPage.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            `http://localhost/?${encodeURI('indexName[page]=10')}`
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
          });

          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            `http://localhost/?${encodeURI('indexName[page]=10')}`
          );
        }

        // Unselect the refinement
        {
          const firstPage = screen.getByRole('link', { name: 'Page 1' });
          await act(async () => {
            firstPage.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            `http://localhost/?${encodeURI('indexName[page]=10')}`
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
            `http://localhost/?${encodeURI('indexName[page]=10')}`
          );
        }
      });
    });
  });
}
