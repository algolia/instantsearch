import { SearchParameters } from 'algoliasearch-helper';
import connect from './connectToggleRefinement';

jest.mock('../core/createConnector');

let props;
let params;

describe('connectToggleRefinement', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const refine = connect.refine.bind(context);
    const getSP = connect.getSearchParameters.bind(context);
    const getMetadata = connect.getMetadata.bind(context);
    const cleanUp = connect.cleanUp.bind(context);
    it('provides the correct props to the component', () => {
      props = getProvidedProps({ attribute: 't' }, {});
      expect(props).toEqual({ currentRefinement: false });

      props = getProvidedProps({ attribute: 't' }, { toggle: { t: true } });
      expect(props).toEqual({ currentRefinement: true });

      props = getProvidedProps({ defaultRefinement: true, attribute: 't' }, {});
      expect(props).toEqual({ currentRefinement: true });
    });

    it("calling refine updates the widget's search state", () => {
      let searchState = refine(
        { attribute: 't' },
        { otherKey: 'val', toggle: { otherKey: false } },
        true
      );
      expect(searchState).toEqual({
        otherKey: 'val',
        page: 1,
        toggle: { t: true, otherKey: false },
      });

      searchState = refine({ attribute: 't' }, { otherKey: 'val' }, false);
      expect(searchState).toEqual({
        page: 1,
        otherKey: 'val',
        toggle: { t: false },
      });
    });

    it('refines the corresponding facet', () => {
      params = getSP(
        new SearchParameters(),
        {
          attribute: 'facet',
          value: 'val',
        },
        { toggle: { facet: true } }
      );
      expect(params.getConjunctiveRefinements('facet')).toEqual(['val']);
    });

    it('applies the provided filter', () => {
      params = getSP(
        new SearchParameters(),
        {
          attribute: 'facet',
          filter: sp => sp.setQuery('yep'),
        },
        { toggle: { facet: true } }
      );
      expect(params.query).toEqual('yep');
    });

    it('registers its filter in metadata', () => {
      let metadata = getMetadata({ attribute: 't' }, {});
      expect(metadata).toEqual({
        items: [],
        id: 't',
        index: 'index',
      });

      metadata = getMetadata(
        { attribute: 't', label: 'yep' },
        { toggle: { t: true } }
      );
      expect(metadata).toEqual({
        items: [
          {
            label: 'yep',
            // Ignore clear, we test it later
            value: metadata.items[0].value,
            attribute: 't',
            currentRefinement: true,
          },
        ],
        id: 't',
        index: 'index',
      });
    });

    it('items value function should clear it from the search state', () => {
      const metadata = getMetadata(
        { attribute: 'one', label: 'yep' },
        { toggle: { one: true, two: false } }
      );

      const searchState = metadata.items[0].value({
        toggle: { one: true, two: false },
      });

      expect(searchState).toEqual({
        page: 1,
        toggle: { one: false, two: false },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = cleanUp(
        { attribute: 'name' },
        {
          toggle: { name: 'searchState', name2: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        toggle: { name2: 'searchState' },
        another: { searchState: 'searchState' },
      });

      searchState = cleanUp({ attribute: 'name2' }, searchState);
      expect(searchState).toEqual({
        toggle: {},
        another: { searchState: 'searchState' },
      });
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
    const getMetadata = connect.getMetadata.bind(context);
    const cleanUp = connect.cleanUp.bind(context);

    it('provides the correct props to the component', () => {
      props = getProvidedProps({ attribute: 't' }, {});
      expect(props).toEqual({ currentRefinement: false });

      props = getProvidedProps(
        { attribute: 't' },
        { indices: { first: { toggle: { t: true } } } }
      );
      expect(props).toEqual({ currentRefinement: true });
    });

    it("calling refine updates the widget's search state", () => {
      let refine = connect.refine.bind(context);

      let searchState = refine(
        { attribute: 't' },
        {
          otherKey: 'val',
          indices: { first: { toggle: { otherKey: false } } },
        },
        true
      );
      expect(searchState).toEqual({
        otherKey: 'val',
        indices: { first: { page: 1, toggle: { t: true, otherKey: false } } },
      });

      context = {
        context: {
          ais: { mainTargetedIndex: 'first' },
          multiIndexContext: { targetedIndex: 'second' },
        },
      };
      refine = connect.refine.bind(context);

      searchState = refine(
        { attribute: 't' },
        { indices: { first: { toggle: { t: true, otherKey: false } } } },
        false
      );
      expect(searchState).toEqual({
        indices: {
          first: { toggle: { t: true, otherKey: false } },
          second: { page: 1, toggle: { t: false } },
        },
      });
    });

    it('refines the corresponding facet', () => {
      params = getSP(
        new SearchParameters(),
        {
          attribute: 'facet',
          value: 'val',
        },
        { indices: { first: { toggle: { facet: true } } } }
      );
      expect(params.getConjunctiveRefinements('facet')).toEqual(['val']);
    });

    it('applies the provided filter', () => {
      params = getSP(
        new SearchParameters(),
        {
          attribute: 'facet',
          filter: sp => sp.setQuery('yep'),
        },
        { indices: { first: { toggle: { facet: true } } } }
      );
      expect(params.query).toEqual('yep');
    });

    it('registers its filter in metadata', () => {
      const metadata = getMetadata(
        { attribute: 't', label: 'yep' },
        { indices: { first: { toggle: { t: true } } } }
      );
      expect(metadata).toEqual({
        items: [
          {
            label: 'yep',
            // Ignore clear, we test it later
            value: metadata.items[0].value,
            attribute: 't',
            currentRefinement: true,
          },
        ],
        id: 't',
        index: 'first',
      });
    });

    it('items value function should clear it from the search state', () => {
      const metadata = getMetadata(
        { attribute: 'one', label: 'yep' },
        { indices: { first: { toggle: { one: true, two: false } } } }
      );

      const searchState = metadata.items[0].value({
        indices: { first: { toggle: { one: true, two: false } } },
      });

      expect(searchState).toEqual({
        indices: { first: { page: 1, toggle: { one: false, two: false } } },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = cleanUp(
        { attribute: 'name' },
        {
          indices: {
            first: { toggle: { name: 'searchState', name2: 'searchState' } },
          },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        indices: { first: { toggle: { name2: 'searchState' } } },
        another: { searchState: 'searchState' },
      });

      searchState = cleanUp({ attribute: 'name2' }, searchState);
      expect(searchState).toEqual({
        indices: { first: { toggle: {} } },
        another: { searchState: 'searchState' },
      });
    });
  });
});
