import { SearchParameters } from 'algoliasearch-helper';
import connect from './connectConfigure.js';

jest.mock('../core/createConnector');

describe('connectConfigure', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getSearchParameters = connect.getSearchParameters.bind(context);
    const transitionState = connect.transitionState.bind(context);
    const cleanUp = connect.cleanUp.bind(context);

    it('propagates the props to the SearchParameters without children', () => {
      const searchParameters = getSearchParameters(
        new SearchParameters(),
        { distinct: 1, whatever: 'please', children: 'whatever' },
        {}
      );
      expect(searchParameters.getQueryParameter('distinct')).toEqual(1);
      expect(searchParameters.getQueryParameter('whatever')).toEqual('please');
      expect(
        searchParameters.getQueryParameter.bind(searchParameters, 'children')
      ).toThrow();
    });

    it('calling transitionState should add configure parameters to the search state', () => {
      const providedThis = {};
      let searchState = transitionState.call(
        providedThis,
        { distinct: 1, whatever: 'please', children: 'whatever' },
        {},
        {}
      );
      expect(searchState).toEqual({
        configure: { distinct: 1, whatever: 'please' },
      });

      searchState = transitionState.call(
        providedThis,
        { whatever: 'other', children: 'whatever' },
        { configure: { distinct: 1, whatever: 'please' } },
        { configure: { distinct: 1, whatever: 'please' } }
      );

      expect(searchState).toEqual({ configure: { whatever: 'other' } });
    });

    it('calling cleanUp should remove configure parameters from the search state', () => {
      let searchState = cleanUp(
        { distinct: 1, whatever: 'please', children: 'whatever' },
        {
          configure: { distinct: 1, whatever: 'please', another: 'parameters' },
        }
      );
      expect(searchState).toEqual({ configure: { another: 'parameters' } });

      searchState = cleanUp(
        { distinct: 1, whatever: 'please', children: 'whatever' },
        { configure: { distinct: 1, whatever: 'please' } }
      );
      expect(searchState).toEqual({ configure: {} });
    });
  });
  describe('multi index', () => {
    let context = {
      context: {
        ais: { mainTargetedIndex: 'first' },
        multiIndexContext: { targetedIndex: 'second' },
      },
    };
    let cleanUp = connect.cleanUp.bind(context);
    const getSearchParameters = connect.getSearchParameters.bind(context);

    it('it propagates the props to the SearchParameters without children', () => {
      const searchParameters = getSearchParameters(
        new SearchParameters(),
        { distinct: 1, whatever: 'please', children: 'whatever' },
        {}
      );
      expect(searchParameters.getQueryParameter('distinct')).toEqual(1);
      expect(searchParameters.getQueryParameter('whatever')).toEqual('please');
      expect(
        searchParameters.getQueryParameter.bind(searchParameters, 'children')
      ).toThrow();
    });

    it('calling transitionState should add configure parameters to the search state', () => {
      let transitionState = connect.transitionState.bind(context);
      let searchState = transitionState(
        { distinct: 1, whatever: 'please', children: 'whatever' },
        {},
        {}
      );
      expect(searchState).toEqual({
        indices: { second: { configure: { distinct: 1, whatever: 'please' } } },
      });

      searchState = transitionState(
        { whatever: 'other', children: 'whatever' },
        {
          indices: {
            second: { configure: { distinct: 1, whatever: 'please' } },
          },
        },
        {
          indices: {
            second: { configure: { distinct: 1, whatever: 'please' } },
          },
        }
      );

      expect(searchState).toEqual({
        indices: { second: { configure: { whatever: 'other' } } },
      });

      context = {
        context: {
          ais: { mainTargetedIndex: 'first' },
          multiIndexContext: { targetedIndex: 'first' },
        },
      };
      transitionState = connect.transitionState.bind(context);

      searchState = transitionState(
        { distinct: 1, whatever: 'please', children: 'whatever' },
        { indices: { second: { configure: { whatever: 'other' } } } },
        { indices: { second: { configure: { whatever: 'other' } } } }
      );

      expect(searchState).toEqual({
        indices: {
          second: { configure: { whatever: 'other' } },
          first: { configure: { distinct: 1, whatever: 'please' } },
        },
      });

      searchState = transitionState(
        { whatever: 'other', children: 'whatever' },
        {
          indices: {
            second: { configure: { whatever: 'other' } },
            first: { configure: { distinct: 1, whatever: 'please' } },
          },
        },
        {
          indices: {
            second: { configure: { whatever: 'other' } },
            first: { configure: { distinct: 1, whatever: 'please' } },
          },
        }
      );

      expect(searchState).toEqual({
        indices: {
          second: { configure: { whatever: 'other' } },
          first: { configure: { whatever: 'other' } },
        },
      });
    });

    it('calling cleanUp should remove configure parameters from the search state', () => {
      let searchState = cleanUp(
        { distinct: 1, whatever: 'please', children: 'whatever' },
        {
          indices: {
            second: { configure: { whatever: 'other' } },
            first: { configure: { distinct: 1, whatever: 'please' } },
          },
        }
      );
      expect(searchState).toEqual({
        indices: {
          first: { configure: { distinct: 1, whatever: 'please' } },
          second: { configure: {} },
        },
      });

      context = {
        context: {
          ais: { mainTargetedIndex: 'first' },
          multiIndexContext: { targetedIndex: 'first' },
        },
      };
      cleanUp = connect.cleanUp.bind(context);

      searchState = cleanUp(
        { distinct: 1, whatever: 'please', children: 'whatever' },
        {
          indices: {
            first: { configure: { distinct: 1, whatever: 'please' } },
            second: { configure: {} },
          },
        }
      );
      expect(searchState).toEqual({
        indices: { first: { configure: {} }, second: { configure: {} } },
      });

      searchState = cleanUp(
        { distinct: 1, whatever: 'please', children: 'whatever' },
        { indices: {} }
      );
      expect(searchState).toEqual({
        indices: {
          first: { configure: {} },
        },
      });
    });
  });
});
