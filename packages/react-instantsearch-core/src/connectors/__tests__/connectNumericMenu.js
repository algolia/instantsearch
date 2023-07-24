import { SearchParameters } from 'algoliasearch-helper';

import connect from '../connectNumericMenu';

jest.mock('../../core/createConnector', () => (x) => x);

let props;
let params;

describe('connectNumericMenu', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    const results = {
      getFacetStats: () => ({ min: 0, max: 300 }),
      getFacetByName: () => true,
      hits: [],
    };

    it('provides the correct props to the component', () => {
      props = connect.getProvidedProps(
        {
          items: [],
          contextValue,
        },
        {},
        { results }
      );

      expect(props).toEqual({
        items: [
          { label: 'All', value: '', isRefined: true, noRefinement: false },
        ],
        currentRefinement: '',
        canRefine: true,
      });

      props = connect.getProvidedProps(
        {
          items: [{ label: 'ALL' }],
          contextValue,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [
          { label: 'ALL', value: '', isRefined: true, noRefinement: false },
        ],
        currentRefinement: '',
        canRefine: true,
      });

      props = connect.getProvidedProps(
        {
          items: [{ label: 'Ok', start: 100 }],
          contextValue,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [
          { label: 'Ok', value: '100:', isRefined: false, noRefinement: false },
          { label: 'All', value: '', isRefined: true, noRefinement: false },
        ],
        currentRefinement: '',
        canRefine: true,
      });

      props = connect.getProvidedProps(
        {
          items: [{ label: 'Not ok', end: 200 }],
          contextValue,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [
          {
            label: 'Not ok',
            value: ':200',
            isRefined: false,
            noRefinement: false,
          },
          { label: 'All', value: '', isRefined: true, noRefinement: false },
        ],
        currentRefinement: '',
        canRefine: true,
      });

      props = connect.getProvidedProps(
        {
          items: [
            { label: 'Ok', start: 100 },
            { label: 'Not ok', end: 200 },
            { label: 'Maybe ok?', start: 100, end: 200 },
          ],
          contextValue,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [
          { label: 'Ok', value: '100:', isRefined: false, noRefinement: false },
          {
            label: 'Not ok',
            value: ':200',
            isRefined: false,
            noRefinement: false,
          },
          {
            label: 'Maybe ok?',
            value: '100:200',
            isRefined: false,
            noRefinement: false,
          },
          { label: 'All', value: '', isRefined: true, noRefinement: false },
        ],
        currentRefinement: '',
        canRefine: true,
      });

      props = connect.getProvidedProps(
        {
          items: [
            { label: 'is 0', start: 0, end: 0 },
            { label: 'in 0..0.5', start: 0, end: 0.5 },
          ],
          contextValue,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [
          {
            label: 'is 0',
            value: '0:0',
            isRefined: false,
            noRefinement: false,
          },
          {
            label: 'in 0..0.5',
            value: '0:0.5',
            isRefined: false,
            noRefinement: false,
          },
          { label: 'All', value: '', isRefined: true, noRefinement: false },
        ],
        currentRefinement: '',
        canRefine: true,
      });

      props = connect.getProvidedProps(
        {
          items: [
            { label: 'is 0', start: 0, end: 0 },
            { label: 'in 0..10', start: 0, end: 10 },
          ],
          contextValue,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [
          {
            label: 'is 0',
            value: '0:0',
            isRefined: false,
            noRefinement: false,
          },
          {
            label: 'in 0..10',
            value: '0:10',
            isRefined: false,
            noRefinement: false,
          },
          { label: 'All', value: '', isRefined: true, noRefinement: false },
        ],
        currentRefinement: '',
        canRefine: true,
      });
    });

    it('no items define', () => {
      props = connect.getProvidedProps(
        { attribute: 'ok', items: [], contextValue },
        { multiRange: { ok: 'wat' } },
        { results }
      );
      expect(props).toEqual({
        items: [
          { label: 'All', value: '', isRefined: true, noRefinement: false },
        ],
        currentRefinement: 'wat',
        canRefine: true,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', items: [], contextValue },
        { multiRange: { ok: 'wat' } },
        {}
      );
      expect(props).toEqual({
        items: [
          { label: 'All', value: '', isRefined: true, noRefinement: true },
        ],
        currentRefinement: 'wat',
        canRefine: false,
      });

      props = connect.getProvidedProps(
        { attribute: 'ok', items: [], defaultRefinement: 'wat', contextValue },
        {},
        {}
      );
      expect(props).toEqual({
        items: [
          { label: 'All', value: '', isRefined: true, noRefinement: true },
        ],
        currentRefinement: 'wat',
        canRefine: false,
      });
    });

    it('use the transform items props if passed', () => {
      const transformItems = jest.fn(() => ['items']);
      props = connect.getProvidedProps(
        {
          items: [
            { label: 'Ok', start: 100 },
            { label: 'Not ok', end: 200 },
            { label: 'Maybe ok?', start: 100, end: 200 },
          ],
          transformItems,
          contextValue,
        },
        {},
        { results }
      );
      expect(transformItems.mock.calls[0][0]).toEqual([
        { label: 'Ok', value: '100:', isRefined: false, noRefinement: false },
        {
          label: 'Not ok',
          value: ':200',
          isRefined: false,
          noRefinement: false,
        },
        {
          label: 'Maybe ok?',
          value: '100:200',
          isRefined: false,
          noRefinement: false,
        },
        { label: 'All', value: '', isRefined: true, noRefinement: false },
      ]);
      expect(props.items).toEqual(['items']);
    });

    it('compute the no refinement value for each item range when stats exists', () => {
      props = connect.getProvidedProps(
        {
          items: [
            { label: '1', start: 100 },
            { label: '2', start: 400 },
            { label: '3', end: 200 },
            { label: '4', start: 100, end: 200 },
            { label: '5', start: 300 },
            { label: '6', start: 300, end: 300 },
          ],
          contextValue,
        },
        {},
        { results }
      );
      expect(props).toEqual({
        items: [
          { label: '1', value: '100:', isRefined: false, noRefinement: false },
          { label: '2', value: '400:', isRefined: false, noRefinement: true },
          { label: '3', value: ':200', isRefined: false, noRefinement: false },
          {
            label: '4',
            value: '100:200',
            isRefined: false,
            noRefinement: false,
          },
          { label: '5', value: '300:', isRefined: false, noRefinement: false },
          {
            label: '6',
            value: '300:300',
            isRefined: false,
            noRefinement: false,
          },
          { label: 'All', value: '', isRefined: true, noRefinement: false },
        ],
        currentRefinement: '',
        canRefine: true,
      });
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = connect.refine(
        { attribute: 'ok', contextValue },
        { otherKey: 'val', multiRange: { otherKey: 'val' } },
        'yep'
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        page: 1,
        multiRange: { ok: 'yep', otherKey: 'val' },
      });
    });

    it('refines the corresponding numeric facet', () => {
      const initSP = new SearchParameters();

      params = connect.getSearchParameters(
        initSP,
        { attribute: 'facet', contextValue },
        { facet: '' }
      );
      expect(params.getNumericRefinements('facet')).toEqual({});

      params = connect.getSearchParameters(
        initSP,
        { attribute: 'facet', contextValue },
        { multiRange: { facet: '100:' } }
      );
      expect(params.getNumericRefinements('facet')).toEqual({
        '>=': [100],
      });

      params = connect.getSearchParameters(
        initSP,
        { attribute: 'facet', contextValue },
        { multiRange: { facet: ':200' } }
      );
      expect(params.getNumericRefinements('facet')).toEqual({
        '<=': [200],
      });

      params = connect.getSearchParameters(
        initSP,
        { attribute: 'facet', contextValue },
        { multiRange: { facet: '100:200' } }
      );
      expect(params.getNumericRefinements('facet')).toEqual({
        '>=': [100],
        '<=': [200],
      });

      params = connect.getSearchParameters(
        initSP,
        { attribute: 'facet', contextValue },
        { multiRange: { facet: '0:' } }
      );
      expect(params.getNumericRefinements('facet')).toEqual({
        '>=': [0],
      });

      params = connect.getSearchParameters(
        initSP,
        { attribute: 'facet', contextValue },
        { multiRange: { facet: ':0' } }
      );
      expect(params.getNumericRefinements('facet')).toEqual({
        '<=': [0],
      });

      params = connect.getSearchParameters(
        initSP,
        { attribute: 'facet', contextValue },
        { multiRange: { facet: '0:0' } }
      );
      expect(params.getNumericRefinements('facet')).toEqual({
        '>=': [0],
        '<=': [0],
      });

      params = connect.getSearchParameters(
        initSP,
        { attribute: 'facet', contextValue },
        { multiRange: { facet: '0:0.5' } }
      );
      expect(params.getNumericRefinements('facet')).toEqual({
        '>=': [0],
        '<=': [0.5],
      });
    });

    it('registers its id in metadata', () => {
      const metadata = connect.getMetadata(
        { attribute: 'ok', contextValue },
        {}
      );
      expect(metadata).toEqual({ id: 'ok', index: 'index', items: [] });
    });

    it('registers its filter in metadata', () => {
      const metadata = connect.getMetadata(
        {
          attribute: 'wot',
          items: [
            {
              label: 'YAY',
              start: 100,
              end: 200,
            },
          ],
          contextValue,
        },
        { multiRange: { wot: '100:200' } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'index',
        items: [
          {
            label: 'wot: YAY',
            // Ignore clear, we test it later
            value: metadata.items[0].value,
            attribute: 'wot',
            currentRefinement: 'YAY',
          },
        ],
      });
    });

    it('items value function should clear it from the search state', () => {
      const metadata = connect.getMetadata(
        {
          attribute: 'one',
          items: [
            {
              label: 'YAY',
              start: 100,
              end: 200,
            },
          ],
          contextValue,
        },
        { multiRange: { one: '100:200', two: '200:400' } }
      );

      const searchState = metadata.items[0].value({
        multiRange: { one: '100:200', two: '200:400' },
      });

      expect(searchState).toEqual({
        page: 1,
        multiRange: { one: '', two: '200:400' },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = connect.cleanUp(
        { attribute: 'name', contextValue },
        {
          multiRange: { name: 'searchState', name2: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        multiRange: { name2: 'searchState' },
        another: { searchState: 'searchState' },
      });

      searchState = connect.cleanUp(
        { attribute: 'name2', contextValue },
        searchState
      );
      expect(searchState).toEqual({
        multiRange: {},
        another: { searchState: 'searchState' },
      });
    });

    it('computes canRefine based on the length of the transformed items list', () => {
      const transformItems = () => [];

      props = connect.getProvidedProps(
        {
          items: [{ label: 'Ok', start: 100 }],
          transformItems,
          contextValue,
        },
        {},
        { results }
      );

      expect(props.canRefine).toEqual(false);
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };

    const results = {
      second: {
        getFacetStats: () => ({ min: 0, max: 300 }),
        getFacetByName: () => true,
      },
    };

    it('provides the correct props to the component', () => {
      props = connect.getProvidedProps(
        {
          attribute: 'ok',
          items: [
            { label: 'Ok', start: 100 },
            { label: 'Not ok', end: 200 },
            { label: 'Maybe ok?', start: 100, end: 200 },
          ],
          contextValue,
          indexContextValue,
        },
        { indices: { second: { multiRange: { ok: 'wat' } } } },
        { results }
      );
      expect(props).toEqual({
        items: [
          { label: 'Ok', value: '100:', isRefined: false, noRefinement: false },
          {
            label: 'Not ok',
            value: ':200',
            isRefined: false,
            noRefinement: false,
          },
          {
            label: 'Maybe ok?',
            value: '100:200',
            isRefined: false,
            noRefinement: false,
          },
          { label: 'All', value: '', isRefined: true, noRefinement: false },
        ],
        currentRefinement: 'wat',
        canRefine: true,
      });
    });

    it("calling refine updates the widget's search state", () => {
      let nextState = connect.refine(
        { attribute: 'ok', contextValue, indexContextValue },
        {
          indices: {
            second: { otherKey: 'val', multiRange: { otherKey: 'val' } },
          },
        },
        'yep'
      );
      expect(nextState).toEqual({
        indices: {
          second: {
            otherKey: 'val',
            page: 1,
            multiRange: { ok: 'yep', otherKey: 'val' },
          },
        },
      });

      nextState = connect.refine(
        {
          attribute: 'ok',
          contextValue,
          indexContextValue,
        },
        {
          indices: {
            second: {
              otherKey: 'val',
              multiRange: { ok: 'yep', otherKey: 'val' },
            },
          },
        },
        'yep'
      );
      expect(nextState).toEqual({
        indices: {
          second: {
            page: 1,
            otherKey: 'val',
            multiRange: { ok: 'yep', otherKey: 'val' },
          },
        },
      });
    });

    it('refines the corresponding numeric facet', () => {
      const initSP = new SearchParameters();

      params = connect.getSearchParameters(
        initSP,
        { attribute: 'facet', contextValue, indexContextValue },
        { indices: { second: { multiRange: { facet: '100:' } } } }
      );
      expect(params.getNumericRefinements('facet')).toEqual({
        '>=': [100],
      });
    });

    it('registers its filter in metadata', () => {
      const metadata = connect.getMetadata(
        {
          attribute: 'wot',
          items: [
            {
              label: 'YAY',
              start: 100,
              end: 200,
            },
          ],
          contextValue,
          indexContextValue,
        },
        { indices: { second: { multiRange: { wot: '100:200' } } } }
      );
      expect(metadata).toEqual({
        id: 'wot',
        index: 'second',
        items: [
          {
            label: 'wot: YAY',
            // Ignore clear, we test it later
            value: metadata.items[0].value,
            attribute: 'wot',
            currentRefinement: 'YAY',
          },
        ],
      });
    });

    it('items value function should clear it from the search state', () => {
      const metadata = connect.getMetadata(
        {
          attribute: 'one',
          items: [
            {
              label: 'YAY',
              start: 100,
              end: 200,
            },
          ],
          contextValue,
          indexContextValue,
        },
        {
          indices: {
            second: { multiRange: { one: '100:200', two: '200:400' } },
          },
        }
      );

      const searchState = metadata.items[0].value({
        indices: { second: { multiRange: { one: '100:200', two: '200:400' } } },
      });

      expect(searchState).toEqual({
        indices: {
          second: { page: 1, multiRange: { one: '', two: '200:400' } },
        },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = connect.cleanUp(
        { attribute: 'name', contextValue, indexContextValue },
        {
          indices: {
            first: {
              another: { name: 'searchState' },
            },
            second: {
              multiRange: { name: 'searchState', name2: 'searchState' },
            },
          },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        indices: {
          first: {
            another: { name: 'searchState' },
          },
          second: { multiRange: { name2: 'searchState' } },
        },
        another: { searchState: 'searchState' },
      });

      searchState = connect.cleanUp(
        { attribute: 'name2', contextValue, indexContextValue },
        searchState
      );
      expect(searchState).toEqual({
        indices: {
          first: {
            another: { name: 'searchState' },
          },
          second: { multiRange: {} },
        },
        another: { searchState: 'searchState' },
      });
    });
  });
});
