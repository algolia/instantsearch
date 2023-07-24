/**
 * @jest-environment jsdom
 */

import isEqual from 'react-fast-compare';

import connect from '../connectInfiniteHits';

jest.mock('../../core/createConnector', () => (x) => x);

describe('connectInfiniteHits', () => {
  describe('single index', () => {
    const contextValue = {
      mainTargetedIndex: 'index',
    };

    it('provides the current hits to the component', () => {
      const hits = [{}];
      const props = connect.getProvidedProps.call({}, { contextValue }, null, {
        results: { hits, page: 0, hitsPerPage: 2, nbPages: 3 },
      });

      expect(props).toEqual({
        hits: hits.map((hit) => expect.objectContaining(hit)),
        hasPrevious: false,
        hasMore: true,
        refinePrevious: expect.any(Function),
        refineNext: expect.any(Function),
      });
    });

    it('accumulate hits internally', () => {
      const hits = [{}, {}];
      const hits2 = [{}, {}];
      const instance = {};

      const res1 = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: { hits, page: 0, hitsPerPage: 2, nbPages: 3 },
        }
      );

      expect(res1.hits).toEqual(
        hits.map((hit) => expect.objectContaining(hit))
      );
      expect(res1.hasMore).toBe(true);

      const res2 = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits: hits2,
            page: 1,
            hitsPerPage: 2,
            nbPages: 3,
          },
        }
      );

      expect(res2.hits).toEqual(
        [...hits, ...hits2].map((hit) => expect.objectContaining(hit))
      );
      expect(res2.hasMore).toBe(true);
    });

    it('prepend hits internally', () => {
      const instance = {};
      const initialPageHits = [{}, {}];
      const previousPageHits = [{}, {}];
      const initialPageProps = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits: initialPageHits,
            page: 1,
            hitsPerPage: 2,
            nbPages: 3,
          },
        }
      );

      expect(initialPageProps.hits).toEqual(
        initialPageHits.map((hit) => expect.objectContaining(hit))
      );
      expect(initialPageProps.hasPrevious).toBe(true);

      const previousPageProps = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits: previousPageHits,
            page: 0,
            hitsPerPage: 2,
            nbPages: 3,
          },
        }
      );

      expect(previousPageProps.hits).toEqual(
        [...previousPageHits, ...initialPageHits].map((hit) =>
          expect.objectContaining(hit)
        )
      );
      expect(previousPageProps.hasPrevious).toBe(false);
    });

    it('accumulate hits internally while changing hitsPerPage configuration', () => {
      const hits = [{}, {}, {}, {}, {}, {}];
      const hits2 = [{}, {}, {}, {}, {}, {}];
      const hits3 = [{}, {}, {}, {}, {}, {}, {}, {}];
      const instance = {};

      const res1 = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits,
            page: 0,
            hitsPerPage: 6,
            nbPages: 10,
            queryID: 'theQueryID_0',
          },
        }
      );

      expect(res1.hits).toEqual(
        hits.map((hit) => expect.objectContaining(hit))
      );
      expect(res1.hits.map((hit) => hit.__position)).toEqual([
        1, 2, 3, 4, 5, 6,
      ]);
      expect(res1.hits.map((hit) => hit.__queryID)).toEqual([
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
      ]);
      expect(res1.hasMore).toBe(true);

      const res2 = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits: hits2,
            page: 1,
            hitsPerPage: 6,
            nbPages: 10,
            queryID: 'theQueryID_1',
          },
        }
      );

      expect(res2.hits).toEqual(
        [...hits, ...hits2].map((hit) => expect.objectContaining(hit))
      );
      expect(res2.hits.map((hit) => hit.__position)).toEqual([
        // page 0
        1, 2, 3, 4, 5, 6,
        // page 1
        7, 8, 9, 10, 11, 12,
      ]);
      expect(res2.hits.map((hit) => hit.__queryID)).toEqual([
        // page 0
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        // page 1
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
      ]);
      expect(res2.hasMore).toBe(true);

      let res3 = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits: hits3,
            page: 2,
            hitsPerPage: 8,
            nbPages: 10,
            queryID: 'theQueryID_2',
          },
        }
      );

      expect(res3.hits).toEqual(
        [...hits, ...hits2, ...hits3].map((hit) => expect.objectContaining(hit))
      );
      expect(res3.hits.map((hit) => hit.__position)).toEqual([
        // page: 0, hitsPerPage: 6
        1, 2, 3, 4, 5, 6,
        // page: 1, hitsPerPage: 6
        7, 8, 9, 10, 11, 12,
        // hitsPerPage changed from 6 to 8, elements 13-16 are skipped
        // page: 2, hitsPerPage: 8
        17, 18, 19, 20, 21, 22, 23, 24,
      ]);
      expect(res3.hits.map((hit) => hit.__queryID)).toEqual([
        // page 0
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        // page 1
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        // page 2
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_2',
      ]);
      expect(res3.hasMore).toBe(true);

      // re-render with the same property
      res3 = connect.getProvidedProps.call(instance, { contextValue }, null, {
        results: {
          hits: hits3,
          page: 2,
          hitsPerPage: 8,
          nbPages: 10,
          queryID: 'theQueryID_2_',
        },
      });

      expect(res3.hits).toEqual(
        [...hits, ...hits2, ...hits3].map((hit) => expect.objectContaining(hit))
      );
      expect(res3.hits.map((hit) => hit.__position)).toEqual([
        // page: 0, hitsPerPage: 6
        1, 2, 3, 4, 5, 6,
        // page: 1, hitsPerPage: 6
        7, 8, 9, 10, 11, 12,
        // hitsPerPage changed from 6 to 8, elements 13-16 are skipped
        // page: 2, hitsPerPage: 8
        17, 18, 19, 20, 21, 22, 23, 24,
      ]);
      expect(res3.hits.map((hit) => hit.__queryID)).toEqual([
        // page 0
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_0',
        // page 1
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_1',
        // page 2
        'theQueryID_2_',
        'theQueryID_2_',
        'theQueryID_2_',
        'theQueryID_2_',
        'theQueryID_2_',
        'theQueryID_2_',
        'theQueryID_2_',
        'theQueryID_2_',
      ]);
      expect(res3.hasMore).toBe(true);
    });

    it('should not reset while accumulating results', () => {
      const hits = [{}, {}];
      const nbPages = 5;
      const instance = {};

      let allHits = [];
      for (let page = 0; page < nbPages - 1; page++) {
        allHits = [...allHits, ...hits];

        const res = connect.getProvidedProps.call(
          instance,
          { contextValue },
          null,
          {
            results: {
              hits,
              page,
              hitsPerPage: hits.length,
              nbPages,
              queryID: `theQueryID_${page}`,
            },
          }
        );

        expect(res.hits).toEqual(
          allHits.map((hit) => expect.objectContaining(hit))
        );
        expect(res.hits).toHaveLength((page + 1) * 2);
        expect(res.hasMore).toBe(true);
      }

      allHits = [...allHits, ...hits];

      const res = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits,
            page: nbPages - 1,
            hitsPerPage: hits.length,
            nbPages,
            queryID: `theQueryID_${nbPages - 1}`,
          },
        }
      );

      expect(res.hits).toHaveLength(nbPages * 2);
      expect(res.hits).toEqual(
        allHits.map((hit) => expect.objectContaining(hit))
      );
      expect(res.hits.map((hit) => hit.__position)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ]);
      expect(res.hits.map((hit) => hit.__queryID)).toEqual([
        'theQueryID_0',
        'theQueryID_0',
        'theQueryID_1',
        'theQueryID_1',
        'theQueryID_2',
        'theQueryID_2',
        'theQueryID_3',
        'theQueryID_3',
        'theQueryID_4',
        'theQueryID_4',
      ]);
      expect(res.hasMore).toBe(false);
    });

    it('Indicates the last page after several pages', () => {
      const hits = [{}, {}];
      const hits2 = [{}, {}];
      const hits3 = [{}];
      const instance = {};

      connect.getProvidedProps.call(instance, { contextValue }, null, {
        results: { hits, page: 0, hitsPerPage: 2, nbPages: 3 },
      });

      connect.getProvidedProps.call(instance, { contextValue }, null, {
        results: {
          hits: hits2,
          page: 1,
          hitsPerPage: 2,
          nbPages: 3,
        },
      });

      const props = connect.getProvidedProps.call(
        instance,
        { contextValue },
        null,
        {
          results: {
            hits: hits3,
            page: 2,
            hitsPerPage: 2,
            nbPages: 3,
          },
        }
      );

      expect(props.hits).toEqual(
        [...hits, ...hits2, ...hits3].map((hit) => expect.objectContaining(hit))
      );
      expect(props.hasMore).toBe(false);
    });

    it('calls refine with next page when calling refineNext', () => {
      const instance = { refine: jest.fn() };
      const hits = [{}, {}];
      const event = new Event('click');

      const props = connect.getProvidedProps.call(
        instance,
        { contextValue },
        {},
        {
          results: {
            hits,
            page: 2,
            hitsPerPage: 2,
            nbPages: 3,
          },
        }
      );

      props.refineNext.call(instance, event);

      expect(instance.refine).toHaveBeenCalledTimes(1);
      expect(instance.refine).toHaveBeenLastCalledWith(event, 3);
    });

    it('calls refine with previous page when calling refinePrevious', () => {
      const instance = { refine: jest.fn() };
      const hits = [{}, {}];
      const event = new Event('click');

      const props = connect.getProvidedProps.call(
        instance,
        { contextValue },
        {},
        {
          results: {
            hits,
            page: 2,
            hitsPerPage: 2,
            nbPages: 3,
          },
        }
      );

      props.refinePrevious.call(instance, event);

      expect(instance.refine).toHaveBeenCalledTimes(1);
      expect(instance.refine).toHaveBeenLastCalledWith(event, 1);
    });

    it('set page to the corresponding index', () => {
      const props = { contextValue };
      const state0 = {};
      const event = new Event('click');
      const index = 5;

      const state1 = connect.refine.call({}, props, state0, event, index);
      // `index` is indexed from 0 but page number is indexed from 1
      expect(state1).toEqual({ page: 6 });
    });

    it('expect to always return an array of hits', () => {
      const props = { contextValue };
      const searchState = {};

      // Retrieve the results from the cache that's why
      // the page it's not zero on the first render
      const searchResults = {
        results: {
          hits: [{}, {}, {}],
          hitsPerPage: 3,
          page: 1,
          nbPages: 3,
        },
      };

      const expectation = {
        hits: [{}, {}, {}].map((hit) => expect.objectContaining(hit)),
        hasPrevious: true,
        hasMore: true,
        refinePrevious: expect.any(Function),
        refineNext: expect.any(Function),
      };

      const actual = connect.getProvidedProps.call(
        {},
        props,
        searchState,
        searchResults
      );

      expect(actual).toEqual(expectation);
    });

    it('does not read from given cache when results is empty', () => {
      const cache = {
        read: jest.fn(),
        write: jest.fn(),
      };
      const props = { cache, contextValue };
      const searchState = {};
      const searchResults = {};
      connect.getProvidedProps.call({}, props, searchState, searchResults);
      expect(cache.read).toHaveBeenCalledTimes(0);
    });

    it('read from given cache', () => {
      const cache = {
        read: jest.fn(),
        write: jest.fn(),
      };
      const props = { cache, contextValue };
      const searchState = {};
      const searchResults = {
        results: {
          hits: [{}, {}, {}],
          hitsPerPage: 3,
          page: 1,
          nbPages: 3,
        },
      };
      connect.getProvidedProps.call({}, props, searchState, searchResults);
      expect(cache.read).toHaveBeenCalledTimes(1);
    });

    it('read from new cache prop', () => {
      const cache = {
        read: jest.fn(),
        write: jest.fn(),
      };
      const searchState = {};
      const searchResults = {
        results: {
          hits: [{}, {}, {}],
          hitsPerPage: 3,
          page: 1,
          nbPages: 3,
        },
      };
      const instance = {};
      connect.getProvidedProps.call(
        instance,
        { cache, contextValue },
        searchState,
        searchResults
      );
      expect(cache.read).toHaveBeenCalledTimes(1);

      const cache2 = {
        read: jest.fn(),
        write: jest.fn(),
      };
      connect.getProvidedProps.call(
        instance,
        { cache: cache2, contextValue },
        searchState,
        searchResults
      );
      expect(cache.read).toHaveBeenCalledTimes(1);
      expect(cache2.read).toHaveBeenCalledTimes(1);
    });

    it('keep the same in-memory cache', () => {
      const searchState = {};
      const searchResults = {};
      const instance = {};
      connect.getProvidedProps.call(
        instance,
        { contextValue },
        searchState,
        searchResults
      );
      const memoryCache = instance._cache;

      connect.getProvidedProps.call(
        instance,
        { contextValue },
        searchState,
        searchResults
      );
      expect(instance._cache).toBe(memoryCache);
    });

    it('render hits correctly after invalidating cache', () => {
      const getStateWithoutPage = (state) => {
        const { page, ...rest } = state || {};
        return rest;
      };

      const getInMemoryCache = () => {
        let cachedHits = undefined;
        let cachedState = undefined;
        return {
          read({ state }) {
            return isEqual(cachedState, getStateWithoutPage(state))
              ? cachedHits
              : null;
          },
          write({ state, hits }) {
            cachedState = getStateWithoutPage(state);
            cachedHits = hits;
          },
          clear() {
            cachedHits = undefined;
            cachedState = undefined;
          },
        };
      };

      const instance = {};
      const cache = getInMemoryCache();
      const props = { cache, contextValue };
      const searchState = {};
      const searchResults1 = {
        results: {
          hits: [{ objectID: 'a' }, { objectID: 'b' }, { objectID: 'c' }],
          hitsPerPage: 3,
          page: 0,
          nbPages: 3,
        },
      };
      expect(
        connect.getProvidedProps.call(
          instance,
          props,
          searchState,
          searchResults1
        ).hits
      ).toMatchInlineSnapshot(`
        [
          {
            "__position": 1,
            "objectID": "a",
          },
          {
            "__position": 2,
            "objectID": "b",
          },
          {
            "__position": 3,
            "objectID": "c",
          },
        ]
      `);

      const searchResults2 = {
        results: {
          hits: [{ objectID: 'd' }, { objectID: 'e' }, { objectID: 'f' }],
          hitsPerPage: 3,
          page: 1,
          nbPages: 3,
        },
      };
      expect(
        connect.getProvidedProps.call(
          instance,
          props,
          searchState,
          searchResults2
        ).hits
      ).toMatchInlineSnapshot(`
        [
          {
            "__position": 1,
            "objectID": "a",
          },
          {
            "__position": 2,
            "objectID": "b",
          },
          {
            "__position": 3,
            "objectID": "c",
          },
          {
            "__position": 4,
            "objectID": "d",
          },
          {
            "__position": 5,
            "objectID": "e",
          },
          {
            "__position": 6,
            "objectID": "f",
          },
        ]
      `);

      cache.clear();
      expect(
        connect.getProvidedProps.call(
          instance,
          props,
          searchState,
          searchResults2
        ).hits
      ).toMatchInlineSnapshot(`
        [
          {
            "__position": 4,
            "objectID": "d",
          },
          {
            "__position": 5,
            "objectID": "e",
          },
          {
            "__position": 6,
            "objectID": "f",
          },
        ]
      `);
    });
  });

  describe('multi index', () => {
    const contextValue = {
      mainTargetedIndex: 'first',
    };
    const indexContextValue = {
      targetedIndex: 'second',
    };

    it('provides the current hits to the component', () => {
      const hits = [{}];
      const props = connect.getProvidedProps.call(
        {},
        { contextValue, indexContextValue },
        null,
        {
          results: { second: { hits, page: 0, hitsPerPage: 2, nbPages: 3 } },
        }
      );

      expect(props).toEqual({
        hits: hits.map((hit) => expect.objectContaining(hit)),
        hasPrevious: false,
        hasMore: true,
        refinePrevious: expect.any(Function),
        refineNext: expect.any(Function),
      });
    });

    it('accumulate hits internally', () => {
      const hits = [{}, {}];
      const hits2 = [{}, {}];

      const instance = {};

      const res1 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: { second: { hits, page: 0, hitsPerPage: 2, nbPages: 3 } },
        }
      );

      expect(res1.hits).toEqual(
        hits.map((hit) => expect.objectContaining(hit))
      );
      expect(res1.hasMore).toBe(true);

      const res2 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits2, page: 1, hitsPerPage: 2, nbPages: 3 },
          },
        }
      );

      expect(res2.hits).toEqual(
        [...hits, ...hits2].map((hit) => expect.objectContaining(hit))
      );
      expect(res2.hasMore).toBe(true);
    });

    it('prepend hits internally', () => {
      const initialPageHits = [{}, {}];
      const previousPageHits = [{}, {}];
      const instance = {};
      const initialPageProps = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: {
              hits: initialPageHits,
              page: 1,
              hitsPerPage: 2,
              nbPages: 3,
            },
          },
        }
      );

      expect(initialPageProps.hits).toEqual(
        initialPageHits.map((hit) => expect.objectContaining(hit))
      );
      expect(initialPageProps.hasPrevious).toBe(true);

      const previousPageProps = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: {
              hits: previousPageHits,
              page: 0,
              hitsPerPage: 2,
              nbPages: 3,
            },
          },
        }
      );

      expect(previousPageProps.hits).toEqual(
        [...previousPageHits, ...initialPageHits].map((hit) =>
          expect.objectContaining(hit)
        )
      );
      expect(previousPageProps.hasPrevious).toBe(false);
    });

    it('accumulate hits internally while changing hitsPerPage configuration', () => {
      const hits = [{}, {}, {}, {}, {}, {}];
      const hits2 = [{}, {}, {}, {}, {}, {}];
      const hits3 = [{}, {}, {}, {}, {}, {}, {}, {}];
      const instance = {};

      const res1 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: { second: { hits, page: 0, hitsPerPage: 6, nbPages: 10 } },
        }
      );

      expect(res1.hits).toEqual(
        hits.map((hit) => expect.objectContaining(hit))
      );
      expect(res1.hasMore).toBe(true);

      const res2 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits2, page: 1, hitsPerPage: 6, nbPages: 10 },
          },
        }
      );

      expect(res2.hits).toEqual(
        [...hits, ...hits2].map((hit) => expect.objectContaining(hit))
      );
      expect(res2.hasMore).toBe(true);

      let res3 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits3, page: 2, hitsPerPage: 8, nbPages: 10 },
          },
        }
      );

      expect(res3.hits).toEqual(
        [...hits, ...hits2, ...hits3].map((hit) => expect.objectContaining(hit))
      );
      expect(res3.hasMore).toBe(true);

      // re-render with the same property
      res3 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits3, page: 2, hitsPerPage: 8, nbPages: 10 },
          },
        }
      );

      expect(res3.hits).toEqual(
        [...hits, ...hits2, ...hits3].map((hit) => expect.objectContaining(hit))
      );
      expect(res3.hasMore).toBe(true);
    });

    it('should not accumulate hits internally while changing query', () => {
      const instance = {};
      const hits = [{}, {}, {}, {}, {}, {}];
      const hits2 = [{}, {}, {}, {}, {}, {}];

      const res1 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: {
              hits,
              page: 0,
              hitsPerPage: 6,
              nbPages: 10,
              _state: { page: 0, query: 'a' },
            },
          },
        }
      );

      expect(res1.hits).toEqual(
        hits.map((hit) => expect.objectContaining(hit))
      );
      expect(res1.hasMore).toBe(true);

      const res2 = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: {
              hits: hits2,
              page: 0,
              hitsPerPage: 6,
              nbPages: 10,
              _state: { page: 0, query: 'b' },
            },
          },
        }
      );

      expect(res2.hits).toEqual(
        hits2.map((hit) => expect.objectContaining(hit))
      );
      expect(res2.hasMore).toBe(true);
    });

    it('should not reset while accumulating results', () => {
      const hits = [{}, {}];
      const nbPages = 100;
      const instance = {};

      let allHits = [];
      for (let page = 0; page < nbPages - 1; page++) {
        allHits = [...allHits, ...hits];

        const res = connect.getProvidedProps.call(
          instance,
          { contextValue, indexContextValue },
          null,
          {
            results: {
              second: {
                hits,
                page,
                hitsPerPage: hits.length,
                nbPages,
              },
            },
          }
        );

        expect(res.hits).toEqual(
          allHits.map((hit) => expect.objectContaining(hit))
        );
        expect(res.hits).toHaveLength((page + 1) * 2);
        expect(res.hasMore).toBe(true);
      }

      allHits = [...allHits, ...hits];

      const res = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: {
              hits,
              page: nbPages - 1,
              hitsPerPage: hits.length,
              nbPages,
            },
          },
        }
      );

      expect(res.hits).toHaveLength(nbPages * 2);
      expect(res.hits).toEqual(
        allHits.map((hit) => expect.objectContaining(hit))
      );
      expect(res.hasMore).toBe(false);
    });

    it('Indicates the last page after several pages', () => {
      const hits = [{}, {}];
      const hits2 = [{}, {}];
      const hits3 = [{}];
      const instance = {};

      connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: { second: { hits, page: 0, hitsPerPage: 2, nbPages: 3 } },
        }
      );

      connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits2, page: 1, hitsPerPage: 2, nbPages: 3 },
          },
        }
      );

      const props = connect.getProvidedProps.call(
        instance,
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: { hits: hits3, page: 2, hitsPerPage: 2, nbPages: 3 },
          },
        }
      );

      expect(props.hits).toEqual(
        [...hits, ...hits2, ...hits3].map((hit) => expect.objectContaining(hit))
      );
      expect(props.hasMore).toBe(false);
    });
  });
});
