import { SearchParameters } from 'algoliasearch-helper';
import connect from './connectPagination';

jest.mock('../core/createConnector');

let props;
let params;

describe('connectPagination', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const refine = connect.refine.bind(context);
    const getSP = connect.getSearchParameters.bind(context);
    const getMetadata = connect.getMetadata.bind(context);
    const cleanUp = connect.cleanUp.bind(context);

    it('provides the correct props to the component', () => {
      props = getProvidedProps({}, {}, { results: { nbPages: 666, hits: [] } });
      expect(props).toEqual({
        currentRefinement: 1,
        nbPages: 666,
        canRefine: true,
      });

      props = getProvidedProps(
        {},
        { page: 5 },
        { results: { nbPages: 666, hits: [] } }
      );
      expect(props).toEqual({
        currentRefinement: 5,
        nbPages: 666,
        canRefine: true,
      });

      props = getProvidedProps(
        {},
        { page: '5' },
        { results: { nbPages: 666, hits: [] } }
      );
      expect(props).toEqual({
        currentRefinement: 5,
        nbPages: 666,
        canRefine: true,
      });

      props = getProvidedProps(
        {},
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
      props = getProvidedProps({}, {}, {});
      expect(props).toBe(null);
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = refine({}, { otherKey: 'val' }, 'yep');
      expect(nextState).toEqual({
        otherKey: 'val',
        page: 'yep',
      });
    });

    it('refines the page parameter', () => {
      const initSP = new SearchParameters();
      params = getSP(initSP, {}, { page: 667 });
      expect(params.page).toBe(666);
    });

    it('registers its id in metadata', () => {
      const metadata = getMetadata({}, {});
      expect(metadata).toEqual({ id: 'page' });
    });

    it('should return the right searchState when clean up', () => {
      const newState = cleanUp(
        {},
        {
          page: { searchState: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(newState).toEqual({ another: { searchState: 'searchState' } });
    });
  });
  describe('multi index', () => {
    let context = {
      context: {
        ais: { mainTargetedIndex: 'first' },
        multiIndexContext: { targetedIndex: 'first' },
      },
    };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const getSP = connect.getSearchParameters.bind(context);
    const cleanUp = connect.cleanUp.bind(context);

    it('provides the correct props to the component', () => {
      props = getProvidedProps(
        {},
        {},
        { results: { first: { nbPages: 666 } } }
      );
      expect(props).toEqual({
        currentRefinement: 1,
        nbPages: 666,
        canRefine: true,
      });

      props = getProvidedProps(
        {},
        { indices: { first: { page: 5 } } },
        { results: { first: { nbPages: 666 } } }
      );
      expect(props).toEqual({
        currentRefinement: 5,
        nbPages: 666,
        canRefine: true,
      });
    });

    it("calling refine updates the widget's search state", () => {
      let refine = connect.refine.bind(context);

      let nextState = refine(
        {},
        { indices: { first: { otherKey: 'val' } } },
        'yep'
      );
      expect(nextState).toEqual({
        indices: {
          first: {
            otherKey: 'val',
            page: 'yep',
          },
        },
      });

      context = {
        context: {
          ais: { mainTargetedIndex: 'first' },
          multiIndexContext: { targetedIndex: 'second' },
        },
      };
      refine = connect.refine.bind(context);

      nextState = refine(
        {},
        { indices: { first: { otherKey: 'val', page: 'yep' } } },
        'yep'
      );
      expect(nextState).toEqual({
        indices: {
          first: { otherKey: 'val', page: 'yep' },
          second: { page: 'yep' },
        },
      });
    });

    it('refines the page parameter', () => {
      const initSP = new SearchParameters();
      params = getSP(initSP, {}, { indices: { first: { page: 667 } } });
      expect(params.page).toBe(666);
    });

    it('should return the right searchState when clean up', () => {
      const newState = cleanUp(
        {},
        {
          indices: {
            first: {
              page: { searchState: 'searchState' },
              another: { searchState: 'searchState' },
            },
          },
        }
      );
      expect(newState).toEqual({
        indices: { first: { another: { searchState: 'searchState' } } },
      });
    });
  });
});
