import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';

import type { PaginationWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptimisticUiTests(
  setup: PaginationWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('optimistic UI', () => {
    test('checks the clicked refinement immediately regardless of network latency', async () => {
      const delay = 100;
      const margin = 10;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
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

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        const firstPrev = 2;
        const nextLast = 2;
        const current = 1;
        const padding = 2 * 3;
        expect(document.querySelectorAll('.ais-Pagination-item')).toHaveLength(
          firstPrev + current + padding + nextLast
        );
        expect(
          document.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-Pagination-item--selected')
        ).toHaveTextContent('1');
      }

      // Select a refinement
      {
        const secondPage = screen.getByRole('link', { name: 'Page 2' });
        await act(async () => {
          secondPage.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(secondPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          document.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        const secondPage = screen.getByRole('link', { name: 'Page 2' });

        await act(async () => {
          await wait(delay + margin);
        });

        expect(secondPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          document.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // Select a refinement
      {
        const firstPage = screen.getByRole('link', { name: 'Page 1' });

        await act(async () => {
          firstPage.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(firstPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          document.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        const firstPage = screen.getByRole('link', { name: 'Page 1' });

        await act(async () => {
          await wait(delay + margin);
        });

        expect(firstPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          document.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }
    });

    test('reverts back to previous state on error', async () => {
      const delay = 100;
      const margin = 10;
      let errors = false;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              if (errors) {
                throw new Error('Network error!');
              }
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

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        const firstPrev = 2;
        const nextLast = 2;
        const current = 1;
        const padding = 2 * 3;
        expect(document.querySelectorAll('.ais-Pagination-item')).toHaveLength(
          firstPrev + current + padding + nextLast
        );
        expect(
          document.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-Pagination-item--selected')
        ).toHaveTextContent('1');
      }

      // start erroring
      errors = true;

      // Select a refinement
      {
        const secondPage = screen.getByRole('link', { name: 'Page 2' });
        await act(async () => {
          secondPage.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(secondPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          document.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        // refinement has reverted back to previous state
        const firstPage = screen.getByRole('link', { name: 'Page 1' });

        await act(async () => {
          await wait(delay + margin);
        });

        expect(firstPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          document.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // stop erroring
      errors = false;

      // Select a refinement
      {
        const secondPage = screen.getByRole('link', { name: 'Page 2' });
        await act(async () => {
          secondPage.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(secondPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          document.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        // refinement is consistent with clicks again
        const secondPage = screen.getByRole('link', { name: 'Page 2' });

        await act(async () => {
          await wait(delay + margin);
        });

        expect(secondPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          document.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }
    });
  });
}
