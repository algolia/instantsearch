import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import connect from './connectRange';

jest.mock('../core/createConnector');

let props;
let params;

describe('connectRange', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const cleanUp = connect.cleanUp.bind(context);

    it('provides the correct props to the component', () => {
      props = getProvidedProps(
        { attribute: 'ok', min: 5, max: 10, precision: 2 },
        {},
        {}
      );
      expect(props).toEqual({
        min: 5,
        max: 10,
        currentRefinement: { min: 5, max: 10 },
        count: [],
        canRefine: false,
        precision: 2,
      });

      let results = {
        getFacetStats: () => ({ min: 5, max: 10 }),
        getFacetValues: () => [
          { name: '5', count: 10 },
          { name: '2', count: 20 },
        ],
        getFacetByName: () => true,
        hits: [],
      };
      props = getProvidedProps(
        {
          attribute: 'ok',
          precision: 2,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        min: 5,
        max: 10,
        currentRefinement: { min: 5, max: 10 },
        count: [{ value: '5', count: 10 }, { value: '2', count: 20 }],
        canRefine: true,
        precision: 2,
      });

      results = {
        getFacetStats: () => ({ min: 0.1, max: 9.9 }),
        getFacetValues: () => [
          { name: '5', count: 10 },
          { name: '2', count: 20 },
        ],
        getFacetByName: () => true,
        hits: [],
      };
      props = getProvidedProps(
        {
          attribute: 'ok',
          precision: 0,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        min: 0,
        max: 10,
        currentRefinement: { min: 0, max: 10 },
        count: [{ value: '5', count: 10 }, { value: '2', count: 20 }],
        canRefine: true,
        precision: 0,
      });

      results = {
        getFacetStats: () => ({ min: 0.1, max: 9.9 }),
        getFacetValues: () => [
          { name: '5', count: 10 },
          { name: '2', count: 20 },
        ],
        getFacetByName: () => true,
        hits: [],
      };
      props = getProvidedProps(
        {
          attribute: 'ok',
          precision: 2,
          min: 0.1,
          max: 9.9,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        min: 0.1,
        max: 9.9,
        currentRefinement: { min: 0.1, max: 9.9 },
        count: [{ value: '5', count: 10 }, { value: '2', count: 20 }],
        canRefine: true,
        precision: 2,
      });

      results = {
        getFacetStats: () => ({ min: 0.1234, max: 9.5678 }),
        getFacetValues: () => [
          { name: '5', count: 10 },
          { name: '2', count: 20 },
        ],
        getFacetByName: () => true,
        hits: [],
      };
      props = getProvidedProps(
        {
          attribute: 'ok',
          precision: 0,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        min: 0,
        max: 10,
        currentRefinement: { min: 0, max: 10 },
        count: [{ value: '5', count: 10 }, { value: '2', count: 20 }],
        canRefine: true,
        precision: 0,
      });

      results = {
        getFacetStats: () => ({ min: 0.1234, max: 9.5678 }),
        getFacetValues: () => [
          { name: '5', count: 10 },
          { name: '2', count: 20 },
        ],
        getFacetByName: () => true,
        hits: [],
      };
      props = getProvidedProps(
        {
          attribute: 'ok',
          precision: 1,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        min: 0.1,
        max: 9.6,
        currentRefinement: { min: 0.1, max: 9.6 },
        count: [{ value: '5', count: 10 }, { value: '2', count: 20 }],
        canRefine: true,
        precision: 1,
      });

      results = {
        getFacetStats: () => ({ min: 0.1234, max: 9.5678 }),
        getFacetValues: () => [
          { name: '5', count: 10 },
          { name: '2', count: 20 },
        ],
        getFacetByName: () => true,
        hits: [],
      };
      props = getProvidedProps(
        {
          attribute: 'ok',
          precision: 2,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        min: 0.12,
        max: 9.57,
        currentRefinement: { min: 0.12, max: 9.57 },
        count: [{ value: '5', count: 10 }, { value: '2', count: 20 }],
        canRefine: true,
        precision: 2,
      });

      results = {
        getFacetStats: () => ({ min: 0.1234, max: 9.5678 }),
        getFacetValues: () => [
          { name: '5', count: 10 },
          { name: '2', count: 20 },
        ],
        getFacetByName: () => true,
        hits: [],
      };
      props = getProvidedProps(
        {
          attribute: 'ok',
          precision: 3,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        min: 0.123,
        max: 9.568,
        currentRefinement: { min: 0.123, max: 9.568 },
        count: [{ value: '5', count: 10 }, { value: '2', count: 20 }],
        canRefine: true,
        precision: 3,
      });

      results = {
        getFacetByName: () => false,
        getFacetStats: () => {},
        getFacetValues: () => [],
        hits: [],
      };
      props = getProvidedProps(
        {
          attribute: 'ok',
          precision: 2,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        min: undefined,
        max: undefined,
        currentRefinement: {
          min: undefined,
          max: undefined,
        },
        count: [],
        canRefine: false,
        precision: 2,
      });

      props = getProvidedProps(
        { attribute: 'ok', precision: 2 },
        { ok: { min: 6, max: 9 } },
        {}
      );
      expect(props).toEqual({
        min: undefined,
        max: undefined,
        currentRefinement: {
          min: undefined,
          max: undefined,
        },
        count: [],
        canRefine: false,
        precision: 2,
      });

      props = getProvidedProps(
        {
          attribute: 'ok',
          min: 5,
          max: 10,
          precision: 2,
        },
        {
          range: { ok: { min: 6, max: 9 } },
        },
        {}
      );
      expect(props).toEqual({
        min: 5,
        max: 10,
        currentRefinement: { min: 6, max: 9 },
        count: [],
        canRefine: false,
        precision: 2,
      });

      props = getProvidedProps(
        {
          attribute: 'ok',
          min: 5,
          max: 10,
          precision: 2,
        },
        {
          range: { ok: { min: '6', max: '9' } },
        },
        {}
      );
      expect(props).toEqual({
        min: 5,
        max: 10,
        currentRefinement: { min: 6, max: 9 },
        count: [],
        canRefine: false,
        precision: 2,
      });

      // With a precision of 0 -> parseInt
      props = getProvidedProps(
        {
          attribute: 'ok',
          min: 5,
          max: 10,
          precision: 0,
        },
        {
          range: { ok: { min: '6.9', max: '9.6' } },
        },
        {}
      );
      expect(props).toEqual({
        min: 5,
        max: 10,
        currentRefinement: { min: 6, max: 9 },
        count: [],
        canRefine: false,
        precision: 0,
      });

      // With a precision of > 0 -> parseFloat
      props = getProvidedProps(
        {
          attribute: 'ok',
          min: 5,
          max: 10,
          precision: 1,
        },
        {
          range: { ok: { min: '6.9', max: '9.6' } },
        },
        {}
      );
      expect(props).toEqual({
        min: 5,
        max: 10,
        currentRefinement: { min: 6.9, max: 9.6 },
        count: [],
        canRefine: false,
        precision: 1,
      });

      props = getProvidedProps(
        {
          attribute: 'ok',
          min: 5,
          max: 10,
          defaultRefinement: { min: 6, max: 9 },
          precision: 2,
        },
        {},
        {}
      );
      expect(props).toEqual({
        min: 5,
        max: 10,
        currentRefinement: { min: 6, max: 9 },
        count: [],
        canRefine: false,
        precision: 2,
      });

      props = getProvidedProps(
        {
          attribute: 'ok',
          precision: 2,
        },
        {},
        {
          results: new SearchResults(new SearchParameters(), [{ hits: [] }]),
        }
      );
      expect(props).toEqual({
        min: undefined,
        max: undefined,
        currentRefinement: {
          min: undefined,
          max: undefined,
        },
        count: [],
        canRefine: false,
        precision: 2,
      });

      expect(() =>
        getProvidedProps(
          {
            attribute: 'ok',
            min: 5,
            max: 10,
            defaultRefinement: { min: 4, max: 9 },
            precision: 2,
          },
          {},
          {}
        )
      ).toThrow("You can't provide min value lower than range.");

      expect(() =>
        getProvidedProps(
          {
            attribute: 'ok',
            min: 5,
            max: 10,
            defaultRefinement: { min: 6, max: 11 },
            precision: 2,
          },
          {},
          {}
        )
      ).toThrow("You can't provide max value greater than range.");
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = connect.refine.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'ok' },
        { otherKey: 'val', range: { otherKey: { min: 1, max: 2 } } },
        { min: 3, max: 5 }
      );
      expect(nextState).toEqual({
        page: 1,
        otherKey: 'val',
        range: { ok: { min: 3, max: 5 }, otherKey: { min: 1, max: 2 } },
      });
    });

    it('calling refine with non finite values should fail', () => {
      function shouldNotRefineWithNaN() {
        connect.refine.call(
          {
            ...context,
            _currentRange: { min: 0, max: 100 },
          },
          { attribute: 'ok' },
          { otherKey: 'val', range: { otherKey: { min: 1, max: 2 } } },
          { min: NaN, max: 5 }
        );
      }
      expect(shouldNotRefineWithNaN).toThrowError(
        "You can't provide non finite values to the range connector"
      );

      function shouldNotRefineWithNull() {
        connect.refine.call(
          {
            ...context,
            _currentRange: { min: 0, max: 100 },
          },
          { attribute: 'ok' },
          { otherKey: 'val', range: { otherKey: { min: 1, max: 2 } } },
          { min: null, max: 5 }
        );
      }
      expect(shouldNotRefineWithNull).toThrowError(
        "You can't provide non finite values to the range connector"
      );
    });

    it('refines the corresponding numeric facet', () => {
      params = connect.getSearchParameters.call(
        {
          ...context,
          _currentRange: {
            min: 10,
            max: 30,
          },
        },
        new SearchParameters(),
        { attribute: 'facet' },
        { range: { facet: { min: 10, max: 30 } } }
      );

      expect(params.getNumericRefinements('facet')).toEqual({
        '>=': [10],
        '<=': [30],
      });

      params = connect.getSearchParameters.call(
        {
          ...context,
          _currentRange: {
            min: 10,
            max: 30,
          },
        },
        new SearchParameters(),
        { attribute: 'facet', min: 10, max: 30 },
        {}
      );

      expect(params.getNumericRefinements('facet')).toEqual({
        '>=': [10],
        '<=': [30],
      });
    });

    it('registers its filter in metadata', () => {
      let metadata = connect.getMetadata.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'wot' },
        { range: { wot: { min: 5 } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'index',
        items: [
          {
            label: '5 <= wot',
            attribute: 'wot',
            currentRefinement: { min: 5, max: 100 },
            // Ignore clear, we test it later
            value: metadata.items[0].value,
          },
        ],
      });

      const searchState = metadata.items[0].value({
        range: { wot: { min: 5 } },
      });
      expect(searchState).toEqual({
        page: 1,
        range: {
          wot: {
            min: undefined,
            max: undefined,
          },
        },
      });

      metadata = connect.getMetadata.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'wot' },
        { range: { wot: { max: 10 } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'index',
        items: [
          {
            label: 'wot <= 10',
            attribute: 'wot',
            currentRefinement: { min: 0, max: 10 },
            value: metadata.items[0].value,
          },
        ],
      });

      metadata = connect.getMetadata.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'wot' },
        { range: { wot: { min: 5, max: 10 } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'index',
        items: [
          {
            label: '5 <= wot <= 10',
            attribute: 'wot',
            currentRefinement: { min: 5, max: 10 },
            value: metadata.items[0].value,
          },
        ],
      });

      metadata = connect.getMetadata.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'wot' },
        { range: { wot: { min: 0, max: 100 } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'index',
        items: [],
      });
    });

    it('items value function should clear it from the search state', () => {
      const metadata = connect.getMetadata.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'one' },
        { range: { one: { min: 5 }, two: { max: 4 } } }
      );

      const searchState = metadata.items[0].value({
        range: { one: { min: 5 }, two: { max: 4 } },
      });

      expect(searchState).toEqual({
        page: 1,
        range: {
          two: {
            max: 4,
          },
          one: {
            min: undefined,
            max: undefined,
          },
        },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = cleanUp(
        { attribute: 'name' },
        {
          range: { name: 'searchState', name2: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        range: { name2: 'searchState' },
        another: { searchState: 'searchState' },
      });

      searchState = cleanUp({ attribute: 'name2' }, searchState);
      expect(searchState).toEqual({
        range: {},
        another: { searchState: 'searchState' },
      });
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
    const cleanUp = connect.cleanUp.bind(context);

    it('provides the correct props to the component', () => {
      const results = {
        first: {
          getFacetStats: () => ({ min: 5, max: 10 }),
          getFacetValues: () => [
            { name: '5', count: 10 },
            { name: '2', count: 20 },
          ],
          getFacetByName: () => true,
        },
      };
      props = getProvidedProps(
        { attribute: 'ok', precision: 2 },
        {},
        { results }
      );
      expect(props).toEqual({
        min: 5,
        max: 10,
        currentRefinement: { min: 5, max: 10 },
        count: [{ value: '5', count: 10 }, { value: '2', count: 20 }],
        canRefine: true,
        precision: 2,
      });

      props = getProvidedProps(
        {
          attribute: 'ok',
          min: 5,
          max: 10,
          precision: 2,
        },
        {
          indices: { first: { range: { ok: { min: 6, max: 9 } } } },
        },
        {}
      );
      expect(props).toEqual({
        min: 5,
        max: 10,
        currentRefinement: { min: 6, max: 9 },
        count: [],
        canRefine: false,
        precision: 2,
      });

      props = getProvidedProps(
        {
          attribute: 'ok',
          precision: 2,
        },
        {},
        {
          results: {
            first: new SearchResults(new SearchParameters(), [{ hits: [] }]),
          },
        }
      );
      expect(props).toEqual({
        min: undefined,
        max: undefined,
        currentRefinement: {
          min: undefined,
          max: undefined,
        },
        count: [],
        canRefine: false,
        precision: 2,
      });
    });

    it("calling refine updates the widget's search state", () => {
      let nextState = connect.refine.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'ok' },
        {
          otherKey: 'val',
          indices: { first: { range: { otherKey: { min: 1, max: 2 } } } },
        },
        { min: 3, max: 5 }
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: {
          first: {
            page: 1,
            range: { ok: { min: 3, max: 5 }, otherKey: { min: 1, max: 2 } },
          },
        },
      });

      nextState = connect.refine.call(
        {
          context: {
            ais: { mainTargetedIndex: 'first' },
            multiIndexContext: { targetedIndex: 'second' },
          },
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'ok' },
        {
          otherKey: 'val',
          indices: { first: { range: { otherKey: { min: 1, max: 2 } } } },
        },
        { min: 3, max: 5 }
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        indices: {
          first: { range: { otherKey: { min: 1, max: 2 } } },
          second: { page: 1, range: { ok: { min: 3, max: 5 } } },
        },
      });
    });

    it('refines the corresponding numeric facet', () => {
      params = getSearchParameters(
        new SearchParameters(),
        { attribute: 'facet' },
        { indices: { first: { range: { facet: { min: 10, max: 30 } } } } }
      );
      expect(params.getNumericRefinements('facet')).toEqual({
        '>=': [10],
        '<=': [30],
      });
    });

    it('registers its filter in metadata', () => {
      let metadata = connect.getMetadata.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'wot' },
        { indices: { first: { range: { wot: { min: 5 } } } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'first',
        items: [
          {
            label: '5 <= wot',
            attribute: 'wot',
            currentRefinement: { min: 5, max: 100 },
            // Ignore clear, we test it later
            value: metadata.items[0].value,
          },
        ],
      });

      const searchState = metadata.items[0].value({
        indices: { first: { range: { wot: { min: 5 } } } },
      });
      expect(searchState).toEqual({
        indices: {
          first: {
            page: 1,
            range: {
              wot: {
                min: undefined,
                max: undefined,
              },
            },
          },
        },
      });

      metadata = connect.getMetadata.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'wot' },
        { indices: { first: { range: { wot: { max: 10 } } } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'first',
        items: [
          {
            label: 'wot <= 10',
            attribute: 'wot',
            currentRefinement: { min: 0, max: 10 },
            value: metadata.items[0].value,
          },
        ],
      });

      metadata = connect.getMetadata.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'wot' },
        { indices: { first: { range: { wot: { max: 100 } } } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'first',
        items: [],
      });
    });

    it('items value function should clear it from the search state', () => {
      const metadata = connect.getMetadata.call(
        {
          ...context,
          _currentRange: { min: 0, max: 100 },
        },
        { attribute: 'one' },
        { indices: { first: { range: { one: { min: 5 }, two: { max: 4 } } } } }
      );

      const searchState = metadata.items[0].value({
        indices: { first: { range: { one: { min: 5 }, two: { max: 4 } } } },
      });

      expect(searchState).toEqual({
        indices: {
          first: {
            page: 1,
            range: {
              one: {
                min: undefined,
                max: undefined,
              },
              two: {
                max: 4,
              },
            },
          },
        },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = cleanUp(
        { attribute: 'name' },
        {
          indices: {
            first: { range: { name: 'searchState', name2: 'searchState' } },
          },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        indices: { first: { range: { name2: 'searchState' } } },
        another: { searchState: 'searchState' },
      });

      searchState = cleanUp({ attribute: 'name2' }, searchState);
      expect(searchState).toEqual({
        another: { searchState: 'searchState' },
        indices: { first: { range: {} } },
      });
    });
  });

  describe('refine', () => {
    it('expect to refine when values are in range', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      const nextRefinement = {
        min: 10,
        max: 90,
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: 10,
            max: 90,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to refine when values are parsable integer', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      const nextRefinement = {
        min: '10',
        max: '90',
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: 10,
            max: 90,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to refine when values are parsable float', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      const nextRefinement = {
        min: '10.15',
        max: '90.85',
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: 10.15,
            max: 90.85,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to refine min at range bound when defined', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 10, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
        min: 10,
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      const nextRefinement = {
        min: 10,
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: 10,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to refine max at range bound when defined', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 90 },
      };

      const propsForRefine = {
        attribute: 'ok',
        max: 90,
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      const nextRefinement = {
        max: 90,
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            max: 90,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to refine min when user bound are set and value is nullable', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 10, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
        min: 10,
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
          ok: {
            min: 20,
            max: 90,
          },
        },
      };

      const nextRefinement = {
        min: undefined,
        max: 90,
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: 10,
            max: 90,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to refine max when user bound are set and value is nullable', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 90 },
      };

      const propsForRefine = {
        attribute: 'ok',
        max: 90,
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
          ok: {
            min: 10,
            max: 90,
          },
        },
      };

      const nextRefinement = {
        min: 10,
        max: undefined,
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: 10,
            max: 90,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to reset min with undefined', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
          ok: {
            min: 5,
            max: 10,
          },
        },
      };

      const nextRefinement = {
        min: undefined,
        max: 10,
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: undefined,
            max: 10,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to reset max with undefined', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
          ok: {
            min: 5,
            max: 10,
          },
        },
      };

      const nextRefinement = {
        min: undefined,
        max: 10,
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: undefined,
            max: 10,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to reset min with empty string', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
          ok: {
            min: 5,
            max: 10,
          },
        },
      };

      const nextRefinement = {
        min: '',
        max: 10,
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: undefined,
            max: 10,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to reset max with empty string', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
          ok: {
            min: 5,
            max: 10,
          },
        },
      };

      const nextRefinement = {
        min: 5,
        max: '',
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: 5,
            max: undefined,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to reset min when value is at bound and no bound are defined', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 10, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
          ok: {
            min: 20,
            max: 90,
          },
        },
      };

      const nextRefinement = {
        min: 10,
        max: 90,
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: undefined,
            max: 90,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to reset max when value is at bound and no bound are defined', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 100 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {
        otherKey: 'val',
        range: {
          otherKey: {
            min: 1,
            max: 2,
          },
          ok: {
            min: 10,
            max: 90,
          },
        },
      };

      const nextRefinement = {
        min: 10,
        max: 100,
      };

      const actual = connect.refine.call(
        thisArgs,
        propsForRefine,
        searchState,
        nextRefinement
      );

      const expectation = {
        page: 1,
        otherKey: 'val',
        range: {
          ok: {
            min: 10,
            max: undefined,
          },
          otherKey: {
            min: 1,
            max: 2,
          },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to throw an error when min is invalid', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 90 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {};

      const nextRefinement = {
        min: 'kdsjhfkd',
      };

      expect(() =>
        connect.refine.call(
          thisArgs,
          propsForRefine,
          searchState,
          nextRefinement
        )
      ).toThrow("You can't provide non finite values to the range connector");
    });

    it('expect to throw an error when max is invalid', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 0, max: 90 },
      };

      const propsForRefine = {
        attribute: 'ok',
      };

      const searchState = {};

      const nextRefinement = {
        max: 'kdsjhfkd',
      };

      expect(() =>
        connect.refine.call(
          thisArgs,
          propsForRefine,
          searchState,
          nextRefinement
        )
      ).toThrow("You can't provide non finite values to the range connector");
    });

    it('expect to throw an error when min is out of range', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 10, max: 90 },
      };

      const propsForRefine = {
        attribute: 'ok',
        min: 10,
      };

      const searchState = {};

      const nextRefinement = {
        min: 0,
      };

      expect(() =>
        connect.refine.call(
          thisArgs,
          propsForRefine,
          searchState,
          nextRefinement
        )
      ).toThrow("You can't provide min value lower than range.");
    });

    it('expect to throw an error when max is out of range', () => {
      const thisArgs = {
        context: { ais: { mainTargetedIndex: 'index' } },
        _currentRange: { min: 10, max: 90 },
      };

      const propsForRefine = {
        attribute: 'ok',
        max: 100,
      };

      const searchState = {};

      const nextRefinement = {
        max: 110,
      };

      expect(() =>
        connect.refine.call(
          thisArgs,
          propsForRefine,
          searchState,
          nextRefinement
        )
      ).toThrow("You can't provide max value greater than range.");
    });
  });
});
