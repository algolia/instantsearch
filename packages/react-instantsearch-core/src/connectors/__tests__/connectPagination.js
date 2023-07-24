import { SearchParameters } from 'algoliasearch-helper';

import connect from '../connectPagination';

jest.mock('../../core/createConnector', () => (x) => x);

let props;
let params;

describe('connectPagination', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    it('provides the correct props to the component', () => {
      props = connect.getProvidedProps(
        { contextValue },
        {},
        { results: { nbPages: 666, hits: [] } }
      );
      expect(props).toEqual({
        currentRefinement: 1,
        nbPages: 666,
        canRefine: true,
      });

      props = connect.getProvidedProps(
        { contextValue },
        { page: 5 },
        { results: { nbPages: 666, hits: [] } }
      );
      expect(props).toEqual({
        currentRefinement: 5,
        nbPages: 666,
        canRefine: true,
      });

      props = connect.getProvidedProps(
        { contextValue },
        { page: '5' },
        { results: { nbPages: 666, hits: [] } }
      );
      expect(props).toEqual({
        currentRefinement: 5,
        nbPages: 666,
        canRefine: true,
      });

      props = connect.getProvidedProps(
        { contextValue },
        { page: '1' },
        { results: { nbPages: 1, hits: [] } }
      );
      expect(props).toEqual({
        currentRefinement: 1,
        nbPages: 1,
        canRefine: false,
      });
    });

    it("doesn't render when no results are available", () => {
      props = connect.getProvidedProps({ contextValue }, {}, {});
      expect(props).toBe(null);
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = connect.refine(
        { contextValue },
        { otherKey: 'val' },
        'yep'
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        page: 'yep',
      });
    });

    it('refines the page parameter', () => {
      const initSP = new SearchParameters();
      params = connect.getSearchParameters(
        initSP,
        { contextValue },
        { page: 667 }
      );
      expect(params.page).toBe(666);
    });

    it('registers its id in metadata', () => {
      const metadata = connect.getMetadata({ contextValue }, {});
      expect(metadata).toEqual({ id: 'page' });
    });

    it('should return the right searchState when clean up', () => {
      const newState = connect.cleanUp(
        { contextValue },
        {
          page: { searchState: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(newState).toEqual({ another: { searchState: 'searchState' } });
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };

    it('provides the correct props to the component', () => {
      props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        {},
        { results: { second: { nbPages: 666 } } }
      );
      expect(props).toEqual({
        currentRefinement: 1,
        nbPages: 666,
        canRefine: true,
      });

      props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        { indices: { second: { page: 5 } } },
        { results: { second: { nbPages: 666 } } }
      );
      expect(props).toEqual({
        currentRefinement: 5,
        nbPages: 666,
        canRefine: true,
      });
    });

    it("calling refine updates the widget's search state", () => {
      let nextState = connect.refine(
        { contextValue, indexContextValue },
        { indices: { second: { otherKey: 'val' } } },
        'yep'
      );
      expect(nextState).toEqual({
        indices: {
          second: {
            otherKey: 'val',
            page: 'yep',
          },
        },
      });

      nextState = connect.refine(
        {
          contextValue: { mainTargetedIndex: 'second' },
          indexContextValue: { targetedIndex: 'second' },
        },
        { indices: { second: { otherKey: 'val', page: 'yep' } } },
        'yep'
      );
      expect(nextState).toEqual({
        indices: {
          second: { otherKey: 'val', page: 'yep' },
        },
      });
    });

    it('refines the page parameter', () => {
      const initSP = new SearchParameters();
      params = connect.getSearchParameters(
        initSP,
        { contextValue, indexContextValue },
        { indices: { second: { page: 667 } } }
      );
      expect(params.page).toBe(666);
    });

    it('should return the right searchState when clean up', () => {
      const newState = connect.cleanUp(
        { contextValue, indexContextValue },
        {
          indices: {
            second: {
              page: { searchState: 'searchState' },
              another: { searchState: 'searchState' },
            },
          },
        }
      );
      expect(newState).toEqual({
        indices: { second: { another: { searchState: 'searchState' } } },
      });
    });
  });
});
