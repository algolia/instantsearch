import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { screen } from '@testing-library/dom';
import type { HitsPerPageSetup } from '.';
import type { Act } from '../../common';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import { history } from 'instantsearch.js/es/lib/routers';

export function createRoutingTests(setup: HitsPerPageSetup, act: Act) {
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
                    createSingleSearchResponse({ hitsPerPage: 12, nbHits: 200 })
                  )
                );
              }),
            }),
          },
          widgetParams: {
            items: [
              { value: 5, label: '5 per page', default: true },
              { value: 10, label: '10 per page' },
            ],
          },
        };

        await setup(options);

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="HitsPerPage-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: { hitsPerPage: 12 },
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
          expect(screen.getByTestId('HitsPerPage-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { hitsPerPage: 12 },
            })
          );
        }

        // Select a refinement
        {
          const tenPerPage = screen.getByRole('option', {
            name: '10 per page',
          });
          await act(async () => {
            tenPerPage.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('HitsPerPage-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { hitsPerPage: 12 },
            })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
          });

          expect(screen.getByTestId('HitsPerPage-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { hitsPerPage: 12 },
            })
          );
        }

        // Unselect the refinement
        {
          const fivePerPage = screen.getByRole('option', {
            name: '5 per page',
          });
          await act(async () => {
            fivePerPage.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('HitsPerPage-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { hitsPerPage: 12 },
            })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
            await wait(0);
          });

          expect(screen.getByTestId('HitsPerPage-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { hitsPerPage: 12 },
            })
          );
        }
      });
    });
  });
}
