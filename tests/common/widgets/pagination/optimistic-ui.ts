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
    test('is checked immediately with a slow network', async () => {
      const delay = 100;
      const margin = 10;
      const attribute = 'brand';
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
        attribute,
      };
      const env = await setup(options);
      const { act = fakeAct } = env;

      // wait for initial results
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

      // select item
      {
        const secondPage = env.container.querySelector<HTMLAnchorElement>(
          '[aria-label="Page 2"]'
        )!;
        await act(async () => {
          secondPage.click();
          await wait(0);
          await wait(0);
        });

        // immediately after interaction
        expect(secondPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          env.container.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // after result comes in
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

      // unselect item
      {
        const firstPage = env.container.querySelector<HTMLAnchorElement>(
          '[aria-label="Page 1"]'
        )!;
        await act(async () => {
          firstPage.click();
          await wait(0);
          await wait(0);
        });

        // immediately after interaction
        expect(firstPage.parentNode).toHaveClass(
          'ais-Pagination-item--selected'
        );
        expect(
          env.container.querySelectorAll('.ais-Pagination-item--selected')
        ).toHaveLength(1);
      }

      // after result comes in
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
