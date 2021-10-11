import connect from '../connectBreadcrumb';

jest.mock('../../core/createConnector', () => (x) => x);

let props;

describe('connectBreadcrumb', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    it('provides the correct props to the component', () => {
      const results = {
        getFacetValues: jest.fn(),
        getFacetByName: () => true,
        hits: [],
      };

      results.getFacetValues.mockImplementationOnce(() => ({}));
      props = connect.getProvidedProps(
        { attributes: ['ok'], contextValue },
        { hierarchicalMenu: { ok: 'wat' } },
        { results }
      );
      expect(props).toEqual({
        canRefine: false,
        items: [],
      });

      results.getFacetValues.mockClear();
      results.getFacetValues.mockImplementation(() => ({
        data: [
          {
            name: 'wat',
            path: 'wat',
            count: 20,
            isRefined: true,
            data: [
              {
                name: 'wot',
                path: 'wat > wot',
                isRefined: true,
                count: 15,
              },
              {
                name: 'wut',
                path: 'wat > wut',
                isRefined: false,
                count: 5,
              },
            ],
          },
          {
            name: 'oy',
            path: 'oy',
            isRefined: false,
            count: 10,
          },
        ],
      }));
      props = connect.getProvidedProps(
        {
          attributes: ['ok'],
          contextValue,
        },
        {},
        { results }
      );
      expect(props.items).toEqual([
        {
          label: 'wat',
          value: 'wat',
        },
        {
          label: 'wot',
          value: 'wat > wot',
        },
      ]);

      const transformItems = jest.fn(() => ['items']);
      props = connect.getProvidedProps(
        { attributes: ['ok'], transformItems, contextValue },
        {},
        { results }
      );
      expect(transformItems.mock.calls[0][0]).toEqual([
        {
          label: 'wat',
          value: 'wat',
        },
        {
          label: 'wot',
          value: 'wat > wot',
        },
      ]);
      expect(props.items).toEqual(['items']);
    });

    it("calling refine updates the widget's search state", () => {
      const nextState = connect.refine(
        { attributes: ['ok'], contextValue },
        { otherKey: 'val', hierarchicalMenu: { otherKey: 'val' } },
        'yep'
      );
      expect(nextState).toEqual({
        otherKey: 'val',
        page: 1,
        hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
      });
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };

    it('provides the correct props to the component', () => {
      const results = {
        second: {
          getFacetValues: jest.fn(),
          getFacetByName: () => true,
        },
      };

      results.second.getFacetValues.mockImplementationOnce(() => ({}));
      props = connect.getProvidedProps(
        { attributes: ['ok'], contextValue, indexContextValue },
        { indices: { second: { hierarchicalMenu: { ok: 'wat' } } } },
        { results }
      );
      expect(props).toEqual({
        canRefine: false,
        items: [],
      });

      props = connect.getProvidedProps(
        { attributes: ['ok'], contextValue, indexContextValue },
        {},
        {}
      );
      expect(props).toEqual({
        canRefine: false,
        items: [],
      });

      results.second.getFacetValues.mockClear();
      results.second.getFacetValues.mockImplementation(() => ({
        data: [
          {
            name: 'wat',
            path: 'wat',
            count: 20,
            isRefined: true,
            data: [
              {
                name: 'wot',
                path: 'wat > wot',
                isRefined: true,
                count: 15,
              },
              {
                name: 'wut',
                path: 'wat > wut',
                isRefined: false,
                count: 5,
              },
            ],
          },
          {
            name: 'oy',
            path: 'oy',
            isRefined: false,
            count: 10,
          },
        ],
      }));
      props = connect.getProvidedProps(
        { attributes: ['ok'], contextValue, indexContextValue },
        {},
        { results }
      );
      expect(props.items).toEqual([
        {
          label: 'wat',
          value: 'wat',
        },
        {
          label: 'wot',
          value: 'wat > wot',
        },
      ]);

      const transformItems = jest.fn(() => ['items']);
      props = connect.getProvidedProps(
        { attributes: ['ok'], transformItems, contextValue, indexContextValue },
        {},
        { results }
      );
      expect(transformItems.mock.calls[0][0]).toEqual([
        {
          label: 'wat',
          value: 'wat',
        },
        {
          label: 'wot',
          value: 'wat > wot',
        },
      ]);
      expect(props.items).toEqual(['items']);
    });

    it("calling refine updates the widget's search state", () => {
      let nextState = connect.refine(
        {
          attributes: ['ok'],
          contextValue,
          indexContextValue,
        },
        {
          indices: {
            first: { otherKey: 'val1', hierarchicalMenu: { otherKey: 'val1' } },
            second: { otherKey: 'val', hierarchicalMenu: { otherKey: 'val' } },
          },
        },
        'yep'
      );

      expect(nextState).toEqual({
        indices: {
          first: {
            otherKey: 'val1',
            hierarchicalMenu: { otherKey: 'val1' },
          },
          second: {
            page: 1,
            otherKey: 'val',
            hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
          },
        },
      });

      nextState = connect.refine(
        {
          attributes: ['ok'],
          contextValue,
          indexContextValue: { targetedIndex: 'second' },
        },
        {
          indices: {
            first: { page: 1, hierarchicalMenu: { otherKey: 'val1' } },
            second: {
              otherKey: 'val',
              hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
            },
          },
        },
        'yep'
      );

      expect(nextState).toEqual({
        indices: {
          first: { page: 1, hierarchicalMenu: { otherKey: 'val1' } },
          second: {
            page: 1,
            otherKey: 'val',
            hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
          },
        },
      });
    });
  });
});
