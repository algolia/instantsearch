/* eslint-env jest, jasmine */

import {
  refineValue,
  getCurrentRefinementValue,
  cleanUpValue,
  getResults,
} from './indexUtils';

describe('utility method for manipulating the search state', () => {
  describe('when there is a single index', () => {
    const context = { ais: { mainTargetedIndex: 'index' } };
    it('refine with no namespace', () => {
      let searchState = {};
      let nextRefinement = { refinement: 'refinement' };
      let resetPage = false;

      searchState = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage
      );

      expect(searchState).toEqual({ refinement: 'refinement' });

      nextRefinement = { another: 'another' };
      searchState = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage
      );

      expect(searchState).toEqual({
        refinement: 'refinement',
        another: 'another',
      });

      nextRefinement = { last: 'last' };
      resetPage = true;
      searchState = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage
      );

      expect(searchState).toEqual({
        page: 1,
        last: 'last',
        refinement: 'refinement',
        another: 'another',
      });
    });

    it('refine with namespace', () => {
      let searchState = {};
      let nextRefinement = { refinement: 'refinement' };
      let resetPage = false;

      searchState = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage,
        'namespace'
      );

      expect(searchState).toEqual({ namespace: { refinement: 'refinement' } });

      nextRefinement = { another: 'another' };
      searchState = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage,
        'namespace'
      );

      expect(searchState).toEqual({
        namespace: { refinement: 'refinement', another: 'another' },
      });

      nextRefinement = { another: 'another' };
      resetPage = true;
      searchState = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage,
        'namespace'
      );

      expect(searchState).toEqual({
        page: 1,
        namespace: { refinement: 'refinement', another: 'another' },
      });
    });

    it('retrieve the current refinement value', () => {
      const searchState = {
        page: 1,
        last: 'last',
        refinement: 'refinement',
        another: 'another',
        namespace: { refinement: 'refinement', another: 'another' },
      };

      let expectedRefinement = value => expect(value).toEqual('refinement');

      getCurrentRefinementValue(
        {},
        searchState,
        context,
        'refinement',
        null,
        expectedRefinement
      );

      expectedRefinement = value => expect(value).toEqual('another');

      getCurrentRefinementValue(
        {},
        searchState,
        context,
        'namespace.another',
        null,
        expectedRefinement
      );

      let value = getCurrentRefinementValue(
        {},
        {},
        context,
        'refinement',
        'defaultValue',
        expectedRefinement
      );

      expect(value).toEqual('defaultValue');

      value = getCurrentRefinementValue(
        { defaultRefinement: 'defaultRefinement' },
        {},
        context,
        'refinement',
        null,
        expectedRefinement
      );

      expect(value).toEqual('defaultRefinement');
    });

    it('clean up values', () => {
      let searchState = {
        page: 1,
        last: 'last',
        refinement: 'refinement',
        another: 'another',
        namespace: { refinement: 'refinement', another: 'another' },
      };

      searchState = cleanUpValue(searchState, context, 'refinement');

      expect(searchState).toEqual({
        page: 1,
        last: 'last',
        another: 'another',
        namespace: { refinement: 'refinement', another: 'another' },
      });

      searchState = cleanUpValue(searchState, context, 'namespace.another');

      expect(searchState).toEqual({
        page: 1,
        last: 'last',
        another: 'another',
        namespace: { refinement: 'refinement' },
      });

      searchState = cleanUpValue(searchState, context, 'namespace.refinement');

      expect(searchState).toEqual({
        page: 1,
        last: 'last',
        another: 'another',
        namespace: {},
      });
    });
    it('get results', () => {
      const searchResults = { results: { some: 'results' } };

      const results = getResults(searchResults, context);

      expect(results).toEqual({ some: 'results' });
    });
  });
  describe('when there are multiple index', () => {
    const context = { multiIndexContext: { targetedIndex: 'first' } };
    it('refine with no namespace', () => {
      let searchState = {};
      let nextRefinement = { refinement: 'refinement' };

      searchState = refineValue(searchState, nextRefinement, context);

      expect(searchState).toEqual({
        indices: { first: { refinement: 'refinement' } },
      });

      nextRefinement = { another: 'another' };
      searchState = refineValue(searchState, nextRefinement, context);

      expect(searchState).toEqual({
        indices: { first: { refinement: 'refinement', another: 'another' } },
      });

      nextRefinement = { last: 'last' };
      const resetPage = true;
      searchState = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage
      );

      expect(searchState).toEqual({
        indices: {
          first: {
            page: 1,
            refinement: 'refinement',
            another: 'another',
            last: 'last',
          },
        },
      });
    });

    it('refine with namespace', () => {
      let searchState = {};
      let nextRefinement = { refinement: 'refinement' };
      let resetPage = false;

      searchState = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage,
        'namespace'
      );

      expect(searchState).toEqual({
        indices: { first: { namespace: { refinement: 'refinement' } } },
      });

      nextRefinement = { another: 'another' };
      searchState = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage,
        'namespace'
      );

      expect(searchState).toEqual({
        indices: {
          first: {
            page: 1,
            namespace: { refinement: 'refinement', another: 'another' },
          },
        },
      });

      nextRefinement = { another: 'another' };
      resetPage = true;
      searchState = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage,
        'namespace'
      );

      expect(searchState).toEqual({
        indices: {
          first: {
            page: 1,
            namespace: { refinement: 'refinement', another: 'another' },
          },
        },
      });
    });

    it('retrieve the current refinement value', () => {
      const searchState = {
        page: 1,
        refinement: 'refinement',
        indices: {
          first: {
            namespace: { refinement: 'refinement', another: 'another' },
          },
        },
      };

      let expectedRefinement = value => expect(value).toEqual('refinement');

      getCurrentRefinementValue(
        {},
        searchState,
        context,
        'refinement',
        null,
        expectedRefinement
      );

      expectedRefinement = value => expect(value).toEqual('another');

      getCurrentRefinementValue(
        {},
        searchState,
        context,
        'namespace.another',
        null,
        expectedRefinement
      );

      let value = getCurrentRefinementValue(
        {},
        {},
        context,
        'refinement',
        'defaultValue',
        expectedRefinement
      );

      expect(value).toEqual('defaultValue');

      value = getCurrentRefinementValue(
        { defaultRefinement: 'defaultRefinement' },
        {},
        context,
        'refinement',
        null,
        expectedRefinement
      );

      expect(value).toEqual('defaultRefinement');
    });

    it('clean up values', () => {
      let searchState = {
        page: 1,
        indices: {
          first: {
            refinement: 'refinement',
            namespace: { refinement: 'refinement', another: 'another' },
          },
        },
      };

      searchState = cleanUpValue(searchState, context, 'refinement');

      expect(searchState).toEqual({
        page: 1,
        indices: {
          first: {
            namespace: { refinement: 'refinement', another: 'another' },
          },
        },
      });

      searchState = cleanUpValue(searchState, context, 'namespace.another');

      expect(searchState).toEqual({
        page: 1,
        indices: { first: { namespace: { refinement: 'refinement' } } },
      });

      searchState = cleanUpValue(searchState, context, 'namespace.refinement');

      expect(searchState).toEqual({
        page: 1,
        indices: { first: { namespace: {} } },
      });
    });

    it('get results', () => {
      const searchResults = { results: { first: { some: 'results' } } };

      const results = getResults(searchResults, context);

      expect(results).toEqual({ some: 'results' });
    });
  });
});
