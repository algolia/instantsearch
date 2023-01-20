import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import type { PaginationSetup } from '.';
import { fakeAct } from '../../common';

export function createOptimisticUiTests(setup: PaginationSetup) {
  // https://github.com/jsdom/jsdom/issues/1695
  window.Element.prototype.scrollIntoView = jest.fn();

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
      const env = await setup(options);
      const { act = fakeAct } = env;

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // before interaction
      {
        const firstPrev = 2;
        const nextLast = 2;
        const current = 1;
        const padding = 2 * 3;
        expect(
          env.container.querySelectorAll('.ais-Pagination-item')
        ).toHaveLength(firstPrev + current + padding + nextLast);
        expect(
          env.container.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
        expect(
          env.container.querySelector('.ais-Pagination-item--selected')
        ).toHaveTextContent('1');
      }

      // Select a refinement
      {
        const secondPage = env.container.querySelector<HTMLAnchorElement>(
          '[aria-label="Page 2"]'
        )!;
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
          env.container.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        const secondPage = env.container.querySelector<HTMLAnchorElement>(
          '[aria-label="Page 2"]'
        )!;

        await act(async () => {
          await wait(delay + margin);
        });

        expect(secondPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          env.container.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // Select a refinement
      {
        const firstPage = env.container.querySelector<HTMLAnchorElement>(
          '[aria-label="Page 1"]'
        )!;
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
          env.container.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        const firstPage = env.container.querySelector<HTMLAnchorElement>(
          '[aria-label="Page 1"]'
        )!;

        await act(async () => {
          await wait(delay + margin);
        });

        expect(firstPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          env.container.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }
    });
  });
}
