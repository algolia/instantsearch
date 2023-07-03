import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { screen } from '@testing-library/dom';
import type { BreadcrumbSetup } from '.';
import type { Act } from '../../common';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import { history } from 'instantsearch.js/es/lib/routers';

export function createRoutingTests(setup: BreadcrumbSetup, act: Act) {
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
        const attributes = ['one', 'two'];

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

        window.history.pushState(
          {},
          '',
          router.createURL({
            indexName: {
              hierarchicalMenu: {
                one: ['Apple', 'iPhone'],
              },
            },
          })
        );

        await setup(options);

        // Before widgets are completely mounted
        {
          // Vue doesn't render anything on first render, so we don't need
          // to check that the URL is correct.
          const link = document.querySelector(
            '[data-testid="Breadcrumb-link"]'
          );
          if (link) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(link).toHaveAttribute(
              'href',
              router.createURL({
                indexName: {
                  hierarchicalMenu: {
                    one: ['Apple'],
                  },
                },
              })
            );
          }
        }

        // Wait for initial results to populate widgets with data
        await act(async () => {
          await wait(margin + delay);
          await wait(0);
        });

        // Initial state, before interaction, URL toggles the last section
        {
          expect(screen.getByTestId('Breadcrumb-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                hierarchicalMenu: {
                  one: ['Apple'],
                },
              },
            })
          );
        }

        // Select a refinement
        {
          const firstItem = screen.getByRole('link', {
            name: 'Apple',
          });
          await act(async () => {
            firstItem.click();
            await wait(0);
            await wait(0);
          });

          // URL now includes "iPhone" as it is no longer refined
          expect(screen.getByTestId('Breadcrumb-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                hierarchicalMenu: {
                  one: ['Apple', 'iPhone'],
                },
              },
            })
          );
        }

        // Wait for new results to come in
        {
          await act(async () => {
            await wait(delay + margin);
          });

          expect(screen.getByTestId('Breadcrumb-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: {
                hierarchicalMenu: {
                  one: ['Apple', 'iPhone'],
                },
              },
            })
          );
        }
      });
    });
  });
}
