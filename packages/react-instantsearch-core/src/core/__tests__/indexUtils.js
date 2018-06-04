import {
  refineValue,
  getCurrentRefinementValue,
  cleanUpValue,
  getResults,
} from '../indexUtils';

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
        namespace: {
          refinement: 'refinement',
          another: 'another',
          'nested.another': 'nested.another',
        },
      };

      expect.assertions(5); // async assertions

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

      expectedRefinement = value => expect(value).toEqual('nested.another');

      getCurrentRefinementValue(
        {},
        searchState,
        context,
        'namespace.nested.another',
        null,
        expectedRefinement
      );

      let value = getCurrentRefinementValue(
        {},
        {},
        context,
        'refinement',
        'defaultValue',
        () => {}
      );

      expect(value).toEqual('defaultValue');

      value = getCurrentRefinementValue(
        { defaultRefinement: 'defaultRefinement' },
        {},
        context,
        'refinement',
        null,
        () => {}
      );

      expect(value).toEqual('defaultRefinement');
    });

    it('clean up values', () => {
      let searchState = {
        page: 1,
        last: 'last',
        refinement: 'refinement',
        another: 'another',
        namespace: {
          refinement: 'refinement',
          another: 'another',
          'nested.another': 'nested.another',
        },
      };

      searchState = cleanUpValue(searchState, context, 'refinement');

      expect(searchState).toEqual({
        page: 1,
        last: 'last',
        another: 'another',
        namespace: {
          refinement: 'refinement',
          another: 'another',
          'nested.another': 'nested.another',
        },
      });

      searchState = cleanUpValue(searchState, context, 'namespace.another');

      expect(searchState).toEqual({
        page: 1,
        last: 'last',
        another: 'another',
        namespace: {
          refinement: 'refinement',
          'nested.another': 'nested.another',
        },
      });

      searchState = cleanUpValue(searchState, context, 'namespace.refinement');

      expect(searchState).toEqual({
        page: 1,
        last: 'last',
        another: 'another',
        namespace: { 'nested.another': 'nested.another' },
      });

      searchState = cleanUpValue(
        searchState,
        context,
        'namespace.nested.another'
      );

      expect(searchState).toEqual({
        page: 1,
        last: 'last',
        another: 'another',
        namespace: {},
      });
    });
    it('get results', () => {
      const searchResults = { results: { hits: ['some'] } };

      const results = getResults(searchResults, context);

      expect(results).toEqual({ hits: ['some'] });
    });
  });
  describe('when there are multiple index', () => {
    let context = { multiIndexContext: { targetedIndex: 'first' } };
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
            refinement: 'refinement',
            namespace: {
              refinement: 'refinement',
              another: 'another',
              'nested.another': 'nested.another',
            },
          },
        },
      };

      expect.assertions(7); // async assertions

      let expectedRefinement = value => expect(value).toEqual('refinement');

      getCurrentRefinementValue(
        {},
        searchState,
        context,
        'refinement',
        null,
        expectedRefinement
      );

      expectedRefinement = value => expect(value).toEqual('refinement');

      getCurrentRefinementValue(
        {},
        searchState,
        context,
        'namespace.refinement',
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

      expectedRefinement = value => expect(value).toEqual('nested.another');

      getCurrentRefinementValue(
        {},
        searchState,
        context,
        'namespace.nested.another',
        null,
        expectedRefinement
      );

      let value = getCurrentRefinementValue(
        {},
        {},
        context,
        'refinement',
        'defaultValue',
        () => {}
      );

      expect(value).toEqual('defaultValue');

      value = getCurrentRefinementValue(
        {},
        searchState,
        context,
        'anotherNamespace.refinement.top',
        'defaultValue',
        () => {}
      );

      expect(value).toEqual('defaultValue');

      value = getCurrentRefinementValue(
        { defaultRefinement: 'defaultRefinement' },
        {},
        context,
        'refinement',
        null,
        () => {}
      );

      expect(value).toEqual('defaultRefinement');
    });

    it('clean up values', () => {
      let searchState = {
        page: 1,
        indices: {
          first: {
            refinement: 'refinement',
            namespace: {
              refinement: 'refinement',
              another: 'another',
              'nested.another': 'nested.another',
            },
          },
        },
      };

      searchState = cleanUpValue(searchState, context, 'refinement');

      expect(searchState).toEqual({
        page: 1,
        indices: {
          first: {
            namespace: {
              refinement: 'refinement',
              another: 'another',
              'nested.another': 'nested.another',
            },
          },
        },
      });

      searchState = cleanUpValue(searchState, context, 'namespace.another');

      expect(searchState).toEqual({
        page: 1,
        indices: {
          first: {
            namespace: {
              refinement: 'refinement',
              'nested.another': 'nested.another',
            },
          },
        },
      });

      searchState = cleanUpValue(searchState, context, 'namespace.refinement');

      expect(searchState).toEqual({
        page: 1,
        indices: {
          first: {
            namespace: {
              'nested.another': 'nested.another',
            },
          },
        },
      });

      searchState = cleanUpValue(
        searchState,
        context,
        'namespace.nested.another'
      );

      expect(searchState).toEqual({
        page: 1,
        indices: {
          first: {
            namespace: {},
          },
        },
      });

      // When nothing is refine the searchState doesn't have the indices
      // attribute even if we are in a context with <Index>. This should
      // not happen, the searchState should always be in sync (indices + no values).
      searchState = {
        page: 1,
      };

      searchState = cleanUpValue(searchState, context, 'namespace.refinement');

      expect(searchState).toEqual({
        page: 1,
        namespace: {},
      });

      // It might happen that we try to cleanUp an index that is not
      // present on the searchState. We should not throw an error in
      // that case, just return the searchState as it is.
      searchState = {
        page: 1,
        indices: {
          second: {
            page: 1,
          },
        },
      };

      searchState = cleanUpValue(searchState, context, 'menu.category');

      expect(searchState).toEqual({
        page: 1,
        indices: {
          second: {
            page: 1,
          },
        },
      });
    });

    it('get results', () => {
      let searchResults = { results: { first: { some: 'results' } } };

      let results = getResults(searchResults, context);

      expect(results).toEqual({ some: 'results' });

      searchResults = { results: { first: { some: 'results' } } };

      results = getResults(searchResults, {
        ais: { mainTargetedIndex: 'first' },
      });

      expect(results).toEqual({ some: 'results' });
    });

    it('refine shared widgets should reset indices page to 1 with resetPage', () => {
      context = {};
      const resetPage = true;
      const nextRefinement = { query: 'new' };
      const searchState = {
        indices: {
          first: { page: 3 },
          second: { page: 3 },
        },
      };

      const actual = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage
      );

      const expectation = {
        query: 'new',
        page: 1,
        indices: {
          first: { page: 1 },
          second: { page: 1 },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('refine shared widgets should not reset indices page to 1 without resetPage', () => {
      context = {};
      const resetPage = false;
      const nextRefinement = { query: 'new' };
      const searchState = {
        indices: {
          first: { page: 3 },
          second: { page: 3 },
        },
      };

      const actual = refineValue(
        searchState,
        nextRefinement,
        context,
        resetPage
      );

      const expectation = {
        query: 'new',
        indices: {
          first: { page: 3 },
          second: { page: 3 },
        },
      };

      expect(actual).toEqual(expectation);
    });
  });
});
