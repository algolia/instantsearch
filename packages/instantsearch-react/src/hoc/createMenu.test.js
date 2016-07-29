/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import createMenu from './createMenu';
import facetRefiner from './facetRefiner';
jest.unmock('./createMenu');

const {
  configure,
  mapStateToProps,
  transformProps,
  refine,
} = createMenu;

describe('createMenu', () => {
  it('derives the right configure options from props', () => {
    const state = {};
    configure(state, {
      attributeName: 'foo',
      limit: 10,
    });
    expect(facetRefiner.configure.mock.calls[0][0]).toBe(state);
    expect(facetRefiner.configure.mock.calls[0][1]).toEqual({
      attributeName: 'foo',
      facetType: 'disjunctive',
      limit: 10,
    });

    configure(state, {
      attributeName: 'foo',
      limit: 20,
    });
    expect(facetRefiner.configure.mock.calls[1][1]).toEqual({
      attributeName: 'foo',
      facetType: 'disjunctive',
      limit: 20,
    });
  });

  it('derives the right mapStateToProps options from props', () => {
    const state = {};
    mapStateToProps(state, {
      attributeName: 'foo',
      sortBy: ['something'],
    });
    expect(facetRefiner.mapStateToProps.mock.calls[0][0]).toBe(state);
    expect(facetRefiner.mapStateToProps.mock.calls[0][1]).toEqual({
      attributeName: 'foo',
      facetType: 'disjunctive',
      sortBy: ['something'],
    });
  });

  it('proxies transformProps', () => {
    const props1 = {
      limit: 10,
    };
    transformProps(props1);
    expect(facetRefiner.transformProps.mock.calls[0][0]).toBe(props1);
  });

  it('derives the right refine options from props', () => {
    const state = {};
    refine(state, {
      attributeName: 'foo',
      selectedItems: [],
    }, 'wat');
    expect(facetRefiner.refine.mock.calls[0][0]).toBe(state);
    expect(facetRefiner.refine.mock.calls[0][1]).toEqual({
      attributeName: 'foo',
      facetType: 'disjunctive',
    });
    expect(facetRefiner.refine.mock.calls[0][2]).toEqual(['wat']);
    refine(state, {
      attributeName: 'foo',
      selectedItems: ['wat'],
    }, 'wat');
    expect(facetRefiner.refine.mock.calls[1][2]).toEqual([]);
  });
});
