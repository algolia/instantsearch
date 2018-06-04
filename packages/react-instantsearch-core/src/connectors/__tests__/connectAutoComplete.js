import { SearchParameters } from 'algoliasearch-helper';
import connect from '../connectAutoComplete';

jest.mock('../../core/createConnector', () => x => x);

describe('connectAutoComplete', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const refine = connect.refine.bind(context);
    const getSearchParameters = connect.getSearchParameters.bind(context);
    const cleanUp = connect.cleanUp.bind(context);
    it('provides current hits to the component', () => {
      const hits = [{}];
      let props = getProvidedProps(
        {},
        {},
        {
          results: { hits },
        }
      );
      expect(props).toEqual({
        hits,
        currentRefinement: '',
      });

      props = getProvidedProps(
        {},
        { query: 'query' },
        {
          results: { hits },
        }
      );
      expect(props).toEqual({
        hits,
        currentRefinement: 'query',
      });

      props = getProvidedProps(
        { defaultRefinement: 'query' },
        {},
        {
          results: { hits },
        }
      );
      expect(props).toEqual({
        hits,
        currentRefinement: 'query',
      });
    });
    it('refines the query parameter', () => {
      const params = getSearchParameters(
        new SearchParameters(),
        {},
        { query: 'bar' }
      );
      expect(params.query).toBe('bar');
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = refine({}, { otherKey: 'val' }, 'yep');
      expect(nextState).toEqual({
        otherKey: 'val',
        query: 'yep',
        page: 1,
      });
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
    const context = {
      context: {
        ais: { mainTargetedIndex: 'first' },
        multiIndexContext: { targetedIndex: 'first' },
      },
    };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const getSearchParameters = connect.getSearchParameters.bind(context);
    const refine = connect.refine.bind(context);
    const cleanUp = connect.cleanUp.bind(context);
    it('provides current hits to the component', () => {
      const firstHits = [{}];
      const secondHits = [{}];
      let props = getProvidedProps(
        {},
        {},
        {
          results: { first: { hits: firstHits }, second: { hits: secondHits } },
        }
      );
      expect(props).toEqual({
        hits: [
          { hits: firstHits, index: 'first' },
          { hits: secondHits, index: 'second' },
        ],
        currentRefinement: '',
      });

      props = getProvidedProps(
        {},
        { indices: { first: { query: 'query' } } },
        {
          results: { first: { hits: firstHits }, second: { hits: secondHits } },
        }
      );
      expect(props).toEqual({
        hits: [
          { hits: firstHits, index: 'first' },
          { hits: secondHits, index: 'second' },
        ],
        currentRefinement: 'query',
      });

      props = getProvidedProps(
        { defaultRefinement: 'query' },
        {},
        {
          results: { first: { hits: firstHits }, second: { hits: secondHits } },
        }
      );
      expect(props).toEqual({
        hits: [
          { hits: firstHits, index: 'first' },
          { hits: secondHits, index: 'second' },
        ],
        currentRefinement: 'query',
      });
    });
    it('refines the query parameter', () => {
      const params = getSearchParameters(
        new SearchParameters(),
        {},
        { indices: { first: { query: 'bar' } } }
      );
      expect(params.query).toBe('bar');
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = refine({}, { otherKey: 'val' }, 'yep');
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: { first: { query: 'yep', page: 1 } },
      });
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
