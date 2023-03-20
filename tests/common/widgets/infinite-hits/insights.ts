import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import type { MockSearchClient } from '@instantsearch/mocks';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import type { InfiniteHitsSetup } from '.';
import type { Act } from '../../common';
import type { SearchClient } from 'instantsearch.js';
import userEvent from '@testing-library/user-event';

declare const window: Window &
  typeof globalThis & {
    aa: jest.Mock;
  };

export function createInsightsTests(setup: InfiniteHitsSetup, act: Act) {
  describe('insights', () => {
    test('sends only one default view event per widget', async () => {
      const delay = 100;
      const margin = 10;
      const hitsPerPage = 2;
      window.aa = jest.fn();
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(
                  ({
                    indexName,
                    params: { page = 0, query } = {},
                  }: Parameters<SearchClient['search']>[0][number]) =>
                    createSingleSearchResponse({
                      hits: Array.from({ length: hitsPerPage }).map(
                        (_, index) => ({
                          objectID: `${indexName}-${
                            page * hitsPerPage + index
                          }`,
                        })
                      ),
                      query,
                      page,
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
      window.aa.mockClear();

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
        expect(
          document.querySelectorAll('#nested-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // View event called for each index once
      {
        expect(window.aa).toHaveBeenCalledTimes(2);
        expect(window.aa).toHaveBeenCalledWith(
          'viewedObjectIDs',
          {
            eventName: 'Hits Viewed',
            index: 'indexName',
            objectIDs: Array.from(
              { length: hitsPerPage },
              (_, index) => `indexName-${index}`
            ),
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
        expect(window.aa).toHaveBeenCalledWith(
          'viewedObjectIDs',
          {
            eventName: 'Hits Viewed',
            index: 'nested',
            objectIDs: Array.from(
              { length: hitsPerPage },
              (_, index) => `nested-${index}`
            ),
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
        window.aa.mockClear();
      }

      // Type in the search box, but cause the same results
      {
        userEvent.type(screen.getByRole('searchbox'), 'a');

        await act(async () => {
          await wait(margin + delay);
          await wait(0);
        });

        // @TODO: This is a bug, we should not send a view event when the results are the same.
        // see: https://github.com/algolia/instantsearch.js/issues/5442
        expect(window.aa).toHaveBeenCalledTimes(2);
      }
    });

    test('splits view events to make sure only 20 events per call are done', async () => {
      const delay = 100;
      const margin = 10;
      const hitsPerPage = 25;
      window.aa = jest.fn();
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(
                  ({
                    indexName,
                    params: { page = 0, query } = {},
                  }: Parameters<SearchClient['search']>[0][number]) =>
                    createSingleSearchResponse({
                      hits: Array.from({ length: hitsPerPage }).map(
                        (_, index) => ({
                          objectID: `${indexName}-${
                            page * hitsPerPage + index
                          }`,
                        })
                      ),
                      query,
                      page,
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
      window.aa.mockClear();

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
        expect(
          document.querySelectorAll('#nested-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // View event called for each index, batched in chunks of 20
      {
        expect(window.aa).toHaveBeenCalledTimes(4);
        expect(window.aa).toHaveBeenCalledWith(
          'viewedObjectIDs',
          {
            eventName: 'Hits Viewed',
            index: 'indexName',
            objectIDs: Array.from(
              { length: 20 },
              (_, index) => `indexName-${index}`
            ),
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
        expect(window.aa).toHaveBeenCalledWith(
          'viewedObjectIDs',
          {
            eventName: 'Hits Viewed',
            index: 'indexName',
            objectIDs: Array.from(
              { length: 5 },
              (_, index) => `indexName-${20 + index}`
            ),
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );

        expect(window.aa).toHaveBeenCalledWith(
          'viewedObjectIDs',
          {
            eventName: 'Hits Viewed',
            index: 'nested',
            objectIDs: Array.from(
              { length: 20 },
              (_, index) => `nested-${index}`
            ),
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
        expect(window.aa).toHaveBeenCalledWith(
          'viewedObjectIDs',
          {
            eventName: 'Hits Viewed',
            index: 'nested',
            objectIDs: Array.from(
              { length: 5 },
              (_, index) => `nested-${20 + index}`
            ),
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
      }
    });

    test('sends only one default click event', async () => {
      const delay = 100;
      const margin = 10;
      const hitsPerPage = 2;
      window.aa = jest.fn();
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(
                  ({
                    indexName,
                    params: { page = 0, query } = {},
                  }: Parameters<SearchClient['search']>[0][number]) =>
                    createSingleSearchResponse({
                      hits: Array.from({ length: hitsPerPage }).map(
                        (_, index) => ({
                          objectID: `${indexName}-${
                            page * hitsPerPage + index
                          }`,
                        })
                      ),
                      query,
                      page,
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
      window.aa.mockClear();

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
        expect(
          document.querySelectorAll('#nested-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Click on the first item of the first index
      {
        window.aa.mockClear();
        userEvent.click(screen.getByTestId('main-hits-top-level-1'));

        expect(window.aa).toHaveBeenCalledTimes(1);
        expect(window.aa).toHaveBeenCalledWith(
          'clickedObjectIDsAfterSearch',
          {
            eventName: 'Hit Clicked',
            index: 'indexName',
            objectIDs: ['indexName-0'],
            positions: [1],
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
      }
    });

    test('sends two default click events on double click', async () => {
      const delay = 100;
      const margin = 10;
      const hitsPerPage = 2;
      window.aa = jest.fn();
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(
                  ({
                    indexName,
                    params: { page = 0, query } = {},
                  }: Parameters<SearchClient['search']>[0][number]) =>
                    createSingleSearchResponse({
                      hits: Array.from({ length: hitsPerPage }).map(
                        (_, index) => ({
                          objectID: `${indexName}-${
                            page * hitsPerPage + index
                          }`,
                        })
                      ),
                      query,
                      page,
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
      window.aa.mockClear();

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
        expect(
          document.querySelectorAll('#nested-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Click on the first item of the first index
      // Click on the first item of the first index
      {
        window.aa.mockClear();
        userEvent.click(screen.getByTestId('main-hits-top-level-1'));
        // simulate real user not being able to click twice in the same frame
        await wait(0);
        userEvent.click(screen.getByTestId('main-hits-top-level-1'));

        expect(window.aa).toHaveBeenCalledTimes(2);
        expect(window.aa).toHaveBeenCalledWith(
          'clickedObjectIDsAfterSearch',
          {
            eventName: 'Hit Clicked',
            index: 'indexName',
            objectIDs: ['indexName-0'],
            positions: [1],
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
      }
    });

    test("sends default click event when there's a user-defined conversion", async () => {
      const delay = 100;
      const margin = 10;
      const hitsPerPage = 2;
      window.aa = jest.fn();
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(
                  ({
                    indexName,
                    params: { page = 0, query } = {},
                  }: Parameters<SearchClient['search']>[0][number]) =>
                    createSingleSearchResponse({
                      hits: Array.from({ length: hitsPerPage }).map(
                        (_, index) => ({
                          objectID: `${indexName}-${
                            page * hitsPerPage + index
                          }`,
                        })
                      ),
                      query,
                      page,
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
      window.aa.mockClear();

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
        expect(
          document.querySelectorAll('#nested-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Click on the first convert button of the first index
      {
        window.aa.mockClear();
        userEvent.click(screen.getByTestId('main-hits-convert-1'));

        expect(window.aa).toHaveBeenCalledTimes(2);
        expect(window.aa).toHaveBeenCalledWith(
          'convertedObjectIDsAfterSearch',
          {
            eventName: 'Converted',
            index: 'indexName',
            objectIDs: ['indexName-0'],
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
        expect(window.aa).toHaveBeenCalledWith(
          'clickedObjectIDsAfterSearch',
          {
            eventName: 'Hit Clicked',
            index: 'indexName',
            objectIDs: ['indexName-0'],
            positions: [1],
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
      }
    });

    test("does not send default click event when there's a user-defined click", async () => {
      const delay = 100;
      const margin = 10;
      const hitsPerPage = 2;
      window.aa = jest.fn();
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(
                  ({
                    indexName,
                    params: { page = 0, query } = {},
                  }: Parameters<SearchClient['search']>[0][number]) =>
                    createSingleSearchResponse({
                      hits: Array.from({ length: hitsPerPage }).map(
                        (_, index) => ({
                          objectID: `${indexName}-${
                            page * hitsPerPage + index
                          }`,
                        })
                      ),
                      query,
                      page,
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
      window.aa.mockClear();

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
        expect(
          document.querySelectorAll('#nested-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Click on the first click button of the first index
      {
        window.aa.mockClear();
        userEvent.click(screen.getByTestId('main-hits-click-1'));

        expect(window.aa).toHaveBeenCalledTimes(1);
        expect(window.aa).toHaveBeenCalledWith(
          'clickedObjectIDsAfterSearch',
          {
            eventName: 'Clicked',
            index: 'indexName',
            objectIDs: ['indexName-0'],
            positions: [1],
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
      }
    });

    test("sends default click event when there's a user-defined click previously in a different widget", async () => {
      const delay = 100;
      const margin = 10;
      const hitsPerPage = 2;
      window.aa = jest.fn();
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(
                  ({
                    indexName,
                    params: { page = 0, query } = {},
                  }: Parameters<SearchClient['search']>[0][number]) =>
                    createSingleSearchResponse({
                      hits: Array.from({ length: hitsPerPage }).map(
                        (_, index) => ({
                          objectID: `${indexName}-${
                            page * hitsPerPage + index
                          }`,
                        })
                      ),
                      query,
                      page,
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
      window.aa.mockClear();

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
        expect(
          document.querySelectorAll('#nested-hits .ais-InfiniteHits-item')
        ).toHaveLength(hitsPerPage);
      }

      // Click on the first click button of the nested index
      // Click on the first item of the main index
      {
        window.aa.mockClear();
        userEvent.click(screen.getByTestId('nested-hits-click-1'));
        userEvent.click(screen.getByTestId('main-hits-top-level-1'));

        expect(window.aa).toHaveBeenCalledTimes(2);
        expect(window.aa).toHaveBeenCalledWith(
          'clickedObjectIDsAfterSearch',
          {
            eventName: 'Clicked nested',
            index: 'nested',
            objectIDs: ['nested-0'],
            positions: [1],
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
        expect(window.aa).toHaveBeenCalledWith(
          'clickedObjectIDsAfterSearch',
          {
            eventName: 'Hit Clicked',
            index: 'indexName',
            objectIDs: ['indexName-0'],
            positions: [1],
          },
          {
            headers: {
              'X-Algolia-API-Key': 'apiKey',
              'X-Algolia-Application-Id': 'appId',
            },
          }
        );
      }
    });
  });
}
