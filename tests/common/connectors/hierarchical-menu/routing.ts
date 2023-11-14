import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';

import type { HierarchicalMenuConnectorSetup } from '.';
import type { TestOptions } from '../../common';

export function createRoutingTests(
  setup: HierarchicalMenuConnectorSetup,
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

        function updateRefinement(value: string) {
          const inputElement = screen.getByTestId(
            'HierarchicalMenu-refine-input'
          );
          userEvent.clear(inputElement);
          userEvent.type(inputElement, `${value}{Enter}`);
        }

        // Initial state, before interaction
        {
          expect(screen.getByTestId('HierarchicalMenu-link')).toHaveAttribute(
            'href',
            router.createURL({
              indexName: { hierarchicalMenu: { [attributes[0]]: ['value'] } },
            })
          );
        }

        // Select the refinement "Apple"
        {
          await act(async () => {
            updateRefinement('Apple');
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

        // Unselect the refinement "Apple"
        {
          await act(async () => {
            updateRefinement('Apple');
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

        // Select the refinement "value"
        {
          await act(async () => {
            updateRefinement('value');
            await wait(0);
            await wait(0);
          });

          // URL has now removed the "value" refinement from its query string
          expect(screen.getByTestId('HierarchicalMenu-link')).toHaveAttribute(
            'href',
            router.createURL({})
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
            router.createURL({})
          );
        }
      });
    });
  });
}
