import { SearchParameters } from 'algoliasearch-helper';
import connect from '../connectHitsPerPage';

jest.mock('../../core/createConnector', () => x => x);

let props;
let params;

describe('connectHitsPerPage', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const refine = connect.refine.bind(context);
    const getSP = connect.getSearchParameters.bind(context);
    const getMetadata = connect.getMetadata.bind(context);
    const cleanUp = connect.cleanUp.bind(context);

    const items = [{ label: '10', value: 10 }, { label: '20', value: 20 }];
    it('provides the correct props to the component', () => {
      props = getProvidedProps({ items }, { hitsPerPage: '10' });
      expect(props).toEqual({
        currentRefinement: 10,
        items: [
          { label: '10', value: 10, isRefined: true },
          {
            label: '20',
            value: 20,
            isRefined: false,
          },
        ],
      });

      props = getProvidedProps({ defaultRefinement: 20, items }, {});
      expect(props).toEqual({
        currentRefinement: 20,
        items: [
          {
            label: '10',
            value: 10,
            isRefined: false,
          },
          { label: '20', value: 20, isRefined: true },
        ],
      });

      const transformItems = jest.fn(() => ['items']);
      props = getProvidedProps(
        { items, transformItems },
        { hitsPerPage: '10' }
      );
      expect(transformItems.mock.calls[0][0]).toEqual([
        { label: '10', value: 10, isRefined: true },
        { label: '20', value: 20, isRefined: false },
      ]);
      expect(props.items).toEqual(['items']);
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = refine({}, { otherKey: 'val' }, 30);
      expect(nextState).toEqual({
        otherKey: 'val',
        page: 1,
        hitsPerPage: 30,
      });
    });

    it('refines the hitsPerPage parameter', () => {
      const sp = new SearchParameters();

      params = getSP(sp, {}, { hitsPerPage: 10 });
      expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

      params = getSP(sp, {}, { hitsPerPage: '10' });
      expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

      params = getSP(sp, { defaultRefinement: 20 }, {});
      expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 20));
    });

    it('registers its id in metadata', () => {
      const metadata = getMetadata({});
      expect(metadata).toEqual({ id: 'hitsPerPage' });
    });

    it('should return the right searchState when clean up', () => {
      const searchState = cleanUp(
        {},
        {
          hitsPerPage: 'searchState',
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
    const getMetadata = connect.getMetadata.bind(context);
    const cleanUp = connect.cleanUp.bind(context);

    const items = [{ label: '10', value: 10 }, { label: '20', value: 20 }];

    it('provides the correct props to the component', () => {
      props = getProvidedProps(
        { items },
        { indices: { first: { hitsPerPage: '10' } } }
      );
      expect(props).toEqual({
        currentRefinement: 10,
        items: [
          { label: '10', value: 10, isRefined: true },
          {
            label: '20',
            value: 20,
            isRefined: false,
          },
        ],
      });

      props = getProvidedProps({ defaultRefinement: 20, items }, {});
      expect(props).toEqual({
        currentRefinement: 20,
        items: [
          {
            label: '10',
            value: 10,
            isRefined: false,
          },
          { label: '20', value: 20, isRefined: true },
        ],
      });

      const transformItems = jest.fn(() => ['items']);
      props = getProvidedProps(
        { items, transformItems },
        { indices: { first: { hitsPerPage: '10' } } }
      );
      expect(transformItems.mock.calls[0][0]).toEqual([
        { label: '10', value: 10, isRefined: true },
        { label: '20', value: 20, isRefined: false },
      ]);
      expect(props.items).toEqual(['items']);
    });

    it("calling refine updates the widget's search state", () => {
      let refine = connect.refine.bind(context);

      let nextState = refine(
        {},
        { indices: { first: { otherKey: 'val' } } },
        30
      );
      expect(nextState).toEqual({
        indices: {
          first: { page: 1, otherKey: 'val', hitsPerPage: 30 },
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
        { indices: { first: { otherKey: 'val', hitsPerPage: 30 } } },
        30
      );
      expect(nextState).toEqual({
        indices: {
          first: { otherKey: 'val', hitsPerPage: 30 },
          second: { page: 1, hitsPerPage: 30 },
        },
      });
    });

    it('correctly applies its state to search parameters', () => {
      const sp = new SearchParameters();

      params = getSP(sp, {}, { indices: { first: { hitsPerPage: '10' } } });
      expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

      params = getSP(sp, {}, { indices: { first: { hitsPerPage: '10' } } });
      expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

      params = getSP(sp, { defaultRefinement: 20 }, {});
      expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 20));
    });

    it('registers its id in metadata', () => {
      const metadata = getMetadata({});
      expect(metadata).toEqual({ id: 'hitsPerPage' });
    });

    it('should return the right searchState when clean up', () => {
      const searchState = cleanUp(
        {},
        {
          indices: {
            first: {
              hitsPerPage: 'searchState',
              another: { searchState: 'searchState' },
            },
          },
        }
      );
      expect(searchState).toEqual({
        indices: { first: { another: { searchState: 'searchState' } } },
      });
    });
  });
});
