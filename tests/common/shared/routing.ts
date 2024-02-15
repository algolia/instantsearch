import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';

import type { SharedSetup } from '.';
import type { TestOptions } from '../common';

export function createRoutingTests(
  setup: SharedSetup,
  { act }: Required<TestOptions>
) {
  describe('routing', () => {
    beforeAll(() => {
      window.history.pushState({}, '', 'http://localhost/');
    });
    afterAll(() => {
      window.history.pushState({}, '', 'http://localhost/');
    });

    describe('URLs created by widgets', () => {
      test('Consistently shows the right URL, even before widgets are initialized', async () => {
        const delay = 100;
        const margin = 10;
        const attribute = 'one';

        const router = history({
          writeDelay: 0,
        });
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
                  ...requests.map(({ params }) =>
                    createSingleSearchResponse({
                      facets: {
                        [attribute]: {
                          Samsung: 100,
                          Apple: 200,
                        },
                      },
                      page: params!.page,
                      nbPages: 20,
                    })
                  )
                );
              }),
            }),
          },
          widgetParams: {
            menu: {
              attribute,
            },
            hits: {},
            pagination: {},
          },
        };

        await setup(options);

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const menuLink = document.querySelector('[data-testid="Menu-link"]');
          if (menuLink) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(menuLink).toHaveAttribute(
              'href',
              router.createURL({
                indexName: {
                  menu: {
                    [attribute]: 'value',
                  },
                },
              })
            );
          }

          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const paginationLink = document.querySelector(
            '[data-testid="Pagination-link"]'
          );
          if (paginationLink) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(paginationLink).toHaveAttribute(
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
          expect(screen.getByTestId('Menu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { menu: { [attribute]: 'value' } },
            })
          );

          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            router.createURL({ indexName: { page: 11 } })
          );
        }

        // Select a refinement
        {
          const firstItem = screen.getByRole('link', {
            name: 'Apple 200',
          });
          await act(async () => {
            firstItem.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('Menu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { menu: { [attribute]: 'value' } },
            })
          );

          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { menu: { [attribute]: 'Apple' }, page: 11 },
            })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
          });

          expect(screen.getByTestId('Menu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { menu: { [attribute]: 'value' } },
            })
          );

          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { menu: { [attribute]: 'Apple' }, page: 11 },
            })
          );
        }

        // Unselect the refinement
        {
          const firstItem = screen.getByRole('link', {
            name: 'Apple 200',
          });
          await act(async () => {
            firstItem.click();
            await wait(0);
            await wait(0);
          });

          // URL is still the same, as it overrides the current state
          expect(screen.getByTestId('Menu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { menu: { [attribute]: 'value' } },
            })
          );

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

          expect(screen.getByTestId('Menu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { menu: { [attribute]: 'value' } },
            })
          );

          expect(screen.getByTestId('Pagination-link')).toHaveAttribute(
            'href',
            router.createURL({ indexName: { page: 11 } })
          );
        }

        // Select a page
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
            router.createURL({ indexName: { page: 11 } })
          );

          expect(screen.getByTestId('Menu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { page: 2, menu: { [attribute]: 'value' } },
            })
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

          expect(screen.getByTestId('Menu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { page: 2, menu: { [attribute]: 'value' } },
            })
          );
        }

        // Unselect the page
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
            router.createURL({ indexName: { page: 11 } })
          );

          expect(screen.getByTestId('Menu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { menu: { [attribute]: 'value' } },
            })
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

          expect(screen.getByTestId('Menu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { menu: { [attribute]: 'value' } },
            })
          );
        }
      });
    });
  });
}
