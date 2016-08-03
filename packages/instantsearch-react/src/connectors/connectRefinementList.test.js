/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import connectRefinementList from './connectRefinementList';
import facetRefiner from './facetRefiner';
jest.unmock('./connectRefinementList');

const {
  configure,
  mapStateToProps,
  transformProps,
  refine,
} = connectRefinementList;

describe('connectRefinementList', () => {
  it('derives the right configure options from props', () => {
    const state = {};
    configure(state, {
      attributeName: 'foo',
      operator: 'or',
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
      operator: 'and',
      limit: 20,
    });
    expect(facetRefiner.configure.mock.calls[1][1]).toEqual({
      attributeName: 'foo',
      facetType: 'conjunctive',
      limit: 20,
    });
  });

  it('derives the right mapStateToProps options from props', () => {
    const state = {};
    mapStateToProps(state, {
      attributeName: 'foo',
      operator: 'or',
      sortBy: ['something'],
    });
    expect(facetRefiner.mapStateToProps.mock.calls[0][0]).toBe(state);
    expect(facetRefiner.mapStateToProps.mock.calls[0][1]).toEqual({
      attributeName: 'foo',
      facetType: 'disjunctive',
      sortBy: ['something'],
    });

    mapStateToProps(state, {
      attributeName: 'foo',
      operator: 'and',
      sortBy: ['something'],
    });
    expect(facetRefiner.mapStateToProps.mock.calls[1][1]).toEqual({
      attributeName: 'foo',
      facetType: 'conjunctive',
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
    const values = [];
    refine(state, {
      attributeName: 'foo',
      operator: 'or',
    }, values);
    expect(facetRefiner.refine.mock.calls[0][0]).toBe(state);
    expect(facetRefiner.refine.mock.calls[0][1]).toEqual({
      attributeName: 'foo',
      facetType: 'disjunctive',
    });
    expect(facetRefiner.refine.mock.calls[0][2]).toBe(values);

    refine(state, {
      attributeName: 'foo',
      operator: 'and',
    }, values);
    expect(facetRefiner.refine.mock.calls[1][1]).toEqual({
      attributeName: 'foo',
      facetType: 'conjunctive',
    });
  });
});
