import { SearchParameters } from 'algoliasearch-helper';
import connect from '../connectSearchBox';

jest.mock('../../core/createConnector', () => x => x);

let props;
let params;

describe('connectSearchBox', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const refine = connect.refine.bind(context);
    const getSP = connect.getSearchParameters.bind(context);
    const cleanUp = connect.cleanUp.bind(context);
    it('provides the correct props to the component', () => {
      props = getProvidedProps({}, {}, {});
      expect(props).toEqual({ currentRefinement: '' });

      props = getProvidedProps({}, { query: 'yep' }, {});
      expect(props).toEqual({ currentRefinement: 'yep' });
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = refine({}, { otherKey: 'val' }, 'yep');
      expect(nextState).toEqual({
        otherKey: 'val',
        page: 1,
        query: 'yep',
      });
    });

    it('supports defaultRefinement', () => {
      expect(getProvidedProps({ defaultRefinement: 'yaw' }, {}, {})).toEqual({
        currentRefinement: 'yaw',
      });
    });

    it('refines the query parameter', () => {
      params = getSP(new SearchParameters(), {}, { query: 'bar' });
      expect(params.query).toBe('bar');
    });

    it('should return the right searchState when clean up', () => {
      const searchState = cleanUp(
        {},
        {
          query: { searchState: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({ another: { searchState: 'searchState' } });
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
      props = getProvidedProps({}, {}, {});
      expect(props).toEqual({ currentRefinement: '' });

      props = getProvidedProps(
        {},
        { indices: { first: { query: 'yep' } } },
        {}
      );
      expect(props).toEqual({ currentRefinement: 'yep' });
    });

    it("calling refine updates the widget's search state", () => {
      let refine = connect.refine.bind(context);

      let nextState = refine({}, { otherKey: 'val' }, 'yep');
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: { first: { query: 'yep', page: 1 } },
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
        { indices: { first: { query: 'yep' } }, otherKey: 'val' },
        'yop'
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: { second: { query: 'yop', page: 1 }, first: { query: 'yep' } },
      });
    });

    it('supports defaultRefinement', () => {
      expect(getProvidedProps({ defaultRefinement: 'yaw' }, {}, {})).toEqual({
        currentRefinement: 'yaw',
      });
    });

    it('refines the query parameter', () => {
      params = getSP(
        new SearchParameters(),
        {},
        { indices: { first: { query: 'bar' } } }
      );
      expect(params.query).toBe('bar');
    });

    it('should return the right searchState when clean up', () => {
      const searchState = cleanUp(
        {},
        {
          indices: { first: { query: '' } },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        indices: { first: {} },
        another: { searchState: 'searchState' },
      });
    });
  });
});
