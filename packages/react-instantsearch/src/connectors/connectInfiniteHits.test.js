/* eslint-env jest, jasmine */

import connect from './connectInfiniteHits.js';
jest.mock('../core/createConnector');

describe('connectInfiniteHits', () => {
  it('provides the current hits to the component', () => {
    const providedThis = {};
    const hits = [{}];
    const props = connect.getProvidedProps.call(providedThis, null, null, {
      results: {hits, page: 0, hitsPerPage: 2, nbPages: 3},
    });
    expect(props).toEqual({hits, hasMore: true});
  });

  it('accumulate hits internally', () => {
    const providedThis = {};
    const hits = [{}, {}];
    const hits2 = [{}, {}];
    const res1 = connect.getProvidedProps.call(providedThis, null, null, {
      results: {hits, page: 0, hitsPerPage: 2, nbPages: 3},
    });
    expect(res1.hits).toEqual(hits);
    expect(res1.hasMore).toBe(true);
    const res2 = connect.getProvidedProps.call(providedThis, null, null, {
      results: {hits: hits2, page: 1, hitsPerPage: 2, nbPages: 3},
    });
    expect(res2.hits).toEqual([...hits, ...hits2]);
    expect(res2.hasMore).toBe(true);
  });

  it('should not reset while accumulating results', () => {
    const providedThis = {};
    const nbPages = 100;
    let allHits = [];

    for (let page = 0; page < nbPages - 1; page++) {
      const hits = [{}, {}];
      allHits = [...allHits, ...hits];
      const res = connect.getProvidedProps.call(providedThis, null, null, {
        results: {
          hits,
          page,
          hitsPerPage: hits.length,
          nbPages,
        },
      });
      expect(res.hits).toEqual(allHits);
      expect(res.hits.length).toEqual((page + 1) * 2);
      expect(res.hasMore).toBe(true);
    }

    const hits = [{}, {}];
    allHits = [...allHits, ...hits];
    const res = connect.getProvidedProps.call(providedThis, null, null, {
      results: {
        hits,
        page: nbPages - 1,
        hitsPerPage: hits.length,
        nbPages,
      },
    });
    expect(res.hits.length).toEqual(nbPages * 2);
    expect(res.hits).toEqual(allHits);
    expect(res.hasMore).toBe(false);
  });

  it('Indicates the last page after several pages', () => {
    const providedThis = {};
    const hits = [{}, {}];
    const hits2 = [{}, {}];
    const hits3 = [{}];
    connect.getProvidedProps.call(providedThis, null, null, {
      results: {hits, page: 0, hitsPerPage: 2, nbPages: 3},
    });
    connect.getProvidedProps.call(providedThis, null, null, {
      results: {hits: hits2, page: 1, hitsPerPage: 2, nbPages: 3},
    });
    const props = connect.getProvidedProps.call(providedThis, null, null, {
      results: {hits: hits3, page: 2, hitsPerPage: 2, nbPages: 3},
    });
    expect(props.hits).toEqual([...hits, ...hits2, ...hits3]);
    expect(props.hasMore).toBe(false);
  });

  it('adds 1 to page when calling refine', () => {
    const props = {};

    const state0 = {};

    const state1 = connect.refine(props, state0);
    expect(state1).toEqual({page: 1});

    const state2 = connect.refine(props, state1);
    expect(state2).toEqual({page: 2});
  });

  it('automatically converts String state to Number', () => {
    const props = {};

    const state0 = {page: '0'};

    const state1 = connect.refine(props, state0);
    expect(state1).toEqual({page: 1});
  });
});
