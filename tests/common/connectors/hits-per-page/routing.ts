import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { screen } from '@testing-library/dom';
import type { HitsPerPageConnectorSetup } from '.';
import type { TestOptions } from '../../common';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import { history } from 'instantsearch.js/es/lib/routers';

export function createRoutingTests(
  setup: HitsPerPageConnectorSetup,
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
          const refine = screen.getByTestId('HitsPerPage-refine');
          await act(async () => {
            refine.click();
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
          const refine = screen.getByTestId('HitsPerPage-refine');
          await act(async () => {
            refine.click();
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
