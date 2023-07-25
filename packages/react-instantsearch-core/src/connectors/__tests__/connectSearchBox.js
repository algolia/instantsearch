import { SearchParameters } from 'algoliasearch-helper';

import connect from '../connectSearchBox';

jest.mock('../../core/createConnector', () => (x) => x);

let props;
let params;

describe('connectSearchBox', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    it('provides the correct props to the component', () => {
      props = connect.getProvidedProps({ contextValue }, {}, {});
      expect(props).toEqual({ currentRefinement: '' });

      props = connect.getProvidedProps({ contextValue }, { query: 'yep' }, {});
      expect(props).toEqual({ currentRefinement: 'yep' });
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = connect.refine(
        { contextValue },
        { otherKey: 'val' },
        'yep'
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        page: 1,
        query: 'yep',
      });
    });

    it('supports defaultRefinement', () => {
      expect(
        connect.getProvidedProps(
          { defaultRefinement: 'yaw', contextValue },
          {},
          {}
        )
      ).toEqual({
        currentRefinement: 'yaw',
      });
    });

    it('refines the query parameter', () => {
      params = connect.getSearchParameters(
        new SearchParameters(),
        { contextValue },
        { query: 'bar' }
      );
      expect(params.query).toBe('bar');
    });

    it('should return the right searchState when clean up', () => {
      const searchState = connect.cleanUp(
        { contextValue },
        {
          query: { searchState: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({ another: { searchState: 'searchState' } });
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };

    it('provides the correct props to the component', () => {
      props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        {},
        {}
      );
      expect(props).toEqual({ currentRefinement: '' });

      props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        { indices: { second: { query: 'yep' } } },
        {}
      );
      expect(props).toEqual({ currentRefinement: 'yep' });
    });

    it("calling refine updates the widget's search state", () => {
      let nextState = connect.refine(
        { contextValue, indexContextValue },
        { otherKey: 'val' },
        'yep'
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: { second: { query: 'yep', page: 1 } },
      });

      nextState = connect.refine(
        {
          contextValue: { mainTargetedIndex: 'first' },
          indexContextValue: { targetedIndex: 'first' },
        },
        {
          indices: {
            first: { query: 'yep' },
          },
          otherKey: 'val',
        },
        'yip'
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: {
          first: { query: 'yip', page: 1 },
        },
      });
    });

    it('supports defaultRefinement', () => {
      expect(
        connect.getProvidedProps(
          { defaultRefinement: 'yaw', contextValue, indexContextValue },
          {},
          {}
        )
      ).toEqual({
        currentRefinement: 'yaw',
      });
    });

    it('refines the query parameter', () => {
      params = connect.getSearchParameters(
        new SearchParameters(),
        { contextValue, indexContextValue },
        { indices: { second: { query: 'bar' } } }
      );
      expect(params.query).toBe('bar');
    });

    it('should return the right searchState when clean up', () => {
      const searchState = connect.cleanUp(
        { contextValue, indexContextValue },
        {
          indices: { second: { query: '' } },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        indices: { second: {} },
        another: { searchState: 'searchState' },
      });
    });
  });
});
