import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import type { MockSearchClient } from '@instantsearch/mocks';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import type { InfiniteHitsWidgetSetup } from '.';
import type { Act } from '../../common';
import type { SearchClient } from 'instantsearch.js';
import userEvent from '@testing-library/user-event';

export function createOptimisticUiTests(setup: InfiniteHitsWidgetSetup, act: Act) {
  describe('optimistic UI', () => {
    test('shows the correct hits, regardless of network latency', async () => {
      const delay = 100;
      const margin = 10;
      const hitsPerPage = 20;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(
                  ({ params }: Parameters<SearchClient['search']>[0][number]) =>
                    createSingleSearchResponse({
                      hits: Array.from({ length: hitsPerPage }).map(
                        (_, index) => ({
                          objectID: `${params!.page! * hitsPerPage + index}`,
                        })
                      ),
                      query: params!.query,
                      page: params!.page,
                      nbPages: 20,
                    })
                )
              );
            }) as MockSearchClient['search'],
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
        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Load the next page
      {
        const nextPage = screen.getAllByRole('button', {
          name: 'Show more results',
        })[0];
        await act(async () => {
          nextPage.click();
          await wait(0);
          await wait(0);
        });

        // UI has not changed yet
        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
        });

        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(2 * hitsPerPage);
      }
    });

    test('shows the correct hits when refining in a different widget, regardless of network latency', async () => {
      const delay = 100;
      const margin = 10;
      const hitsPerPage = 20;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(
                  ({ params }: Parameters<SearchClient['search']>[0][number]) =>
                    createSingleSearchResponse({
                      hits: Array.from({ length: hitsPerPage }).map(
                        (_, index) => ({
                          objectID: `${params!.page! * hitsPerPage + index}`,
                        })
                      ),
                      query: params!.query,
                      page: params!.page,
                      nbPages: 20,
                    })
                )
              );
            }) as MockSearchClient['search'],
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
        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Do a refinement on a different widget
      {
        const searchBox = screen.getByRole('searchbox');

        await act(async () => {
          userEvent.type(searchBox, 'a');
          await wait(0);
          await wait(0);
        });

        // UI has not changed yet
        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
        });

        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }
    });

    test('reverts back to previous state on error', async () => {
      const delay = 100;
      const margin = 10;
      const hitsPerPage = 20;
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
                ...requests.map(
                  ({ params }: Parameters<SearchClient['search']>[0][number]) =>
                    createSingleSearchResponse({
                      hits: Array.from({ length: hitsPerPage }).map(
                        (_, index) => ({
                          objectID: `${params!.page! * hitsPerPage + index}`,
                        })
                      ),
                      query: params!.query,
                      page: params!.page,
                      nbPages: 20,
                    })
                )
              );
            }) as MockSearchClient['search'],
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
        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      errors = true;

      // Load the next page
      {
        const nextPage = screen.getAllByRole('button', {
          name: 'Show more results',
        })[0];
        await act(async () => {
          nextPage.click();
          await wait(0);
          await wait(0);
        });

        // UI has not changed yet
        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
        });

        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      errors = false;

      // Load the next page
      {
        const nextPage = screen.getAllByRole('button', {
          name: 'Show more results',
        })[0];
        await act(async () => {
          nextPage.click();
          await wait(0);
          await wait(0);
        });

        // UI has not changed yet
        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
        });

        expect(
          document.querySelectorAll('#main-hits .ais-InfiniteHits-item')
        ).toHaveLength(2 * hitsPerPage);
      }
    });
  });
}
