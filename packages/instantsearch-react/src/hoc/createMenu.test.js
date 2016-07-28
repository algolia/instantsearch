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
      showMore: false,
      limitMin: 10,
      limitMax: 20,
    });
    expect(facetRefiner.configure.mock.calls[0][0]).toBe(state);
    expect(facetRefiner.configure.mock.calls[0][1]).toEqual({
      facetName: 'foo',
      facetType: 'disjunctive',
      valuesPerFacet: 10,
    });

    configure(state, {
      attributeName: 'foo',
      showMore: true,
      limitMin: 10,
      limitMax: 20,
    });
    expect(facetRefiner.configure.mock.calls[1][1]).toEqual({
      facetName: 'foo',
      facetType: 'disjunctive',
      valuesPerFacet: 20,
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
      facetName: 'foo',
      facetType: 'disjunctive',
      sortBy: ['something'],
    });
  });

  it('derives the right transformProps options from props', () => {
    const props1 = {
      showMore: false,
      limitMin: 10,
      limitMax: 20,
    };
    transformProps(props1);
    expect(facetRefiner.transformProps.mock.calls[0][0]).toBe(props1);
    expect(facetRefiner.transformProps.mock.calls[0][1]).toEqual({
      valuesPerFacet: 10,
    });
    const props2 = {
      showMore: true,
      limitMin: 10,
      limitMax: 20,
    };
    transformProps(props2);
    expect(facetRefiner.transformProps.mock.calls[1][1]).toEqual({
      valuesPerFacet: 20,
    });
  });

  it('derives the right refine options from props', () => {
    const state = {};
    refine(state, {
      attributeName: 'foo',
      selectedItems: [],
    }, 'wat');
    expect(facetRefiner.refine.mock.calls[0][0]).toBe(state);
    expect(facetRefiner.refine.mock.calls[0][1]).toEqual({
      facetName: 'foo',
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
