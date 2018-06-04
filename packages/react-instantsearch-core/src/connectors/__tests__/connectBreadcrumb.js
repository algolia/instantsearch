import connect from '../connectBreadcrumb';

jest.mock('../../core/createConnector', () => x => x);

let props;

describe('connectHierarchicalMenu', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    const refine = connect.refine.bind(context);

    it('provides the correct props to the component', () => {
      const results = {
        getFacetValues: jest.fn(),
        getFacetByName: () => true,
        hits: [],
      };

      results.getFacetValues.mockImplementationOnce(() => ({}));
      props = getProvidedProps(
        { attributes: ['ok'] },
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
      props = getProvidedProps({ attributes: ['ok'] }, {}, { results });
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
      props = getProvidedProps(
        { attributes: ['ok'], transformItems },
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
      const nextState = refine(
        { attributes: ['ok'] },
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
    let context = {
      context: {
        ais: { mainTargetedIndex: 'first' },
        multiIndexContext: { targetedIndex: 'first' },
      },
    };
    const getProvidedProps = connect.getProvidedProps.bind(context);

    it('provides the correct props to the component', () => {
      const results = {
        first: {
          getFacetValues: jest.fn(),
          getFacetByName: () => true,
        },
      };

      results.first.getFacetValues.mockImplementationOnce(() => ({}));
      props = getProvidedProps(
        { attributes: ['ok'] },
        { indices: { first: { hierarchicalMenu: { ok: 'wat' } } } },
        { results }
      );
      expect(props).toEqual({
        canRefine: false,
        items: [],
      });

      props = getProvidedProps({ attributes: ['ok'] }, {}, {});
      expect(props).toEqual({
        canRefine: false,
        items: [],
      });

      results.first.getFacetValues.mockClear();
      results.first.getFacetValues.mockImplementation(() => ({
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
      props = getProvidedProps({ attributes: ['ok'] }, {}, { results });
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
      props = getProvidedProps(
        { attributes: ['ok'], transformItems },
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
      let refine = connect.refine.bind(context);

      let nextState = refine(
        { attributes: ['ok'] },
        {
          indices: {
            first: { otherKey: 'val', hierarchicalMenu: { otherKey: 'val' } },
          },
        },
        'yep'
      );
      expect(nextState).toEqual({
        indices: {
          first: {
            otherKey: 'val',
            page: 1,
            hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
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
        { attributes: ['ok'] },
        {
          indices: {
            first: {
              otherKey: 'val',
              hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
            },
          },
        },
        'yep'
      );

      expect(nextState).toEqual({
        indices: {
          first: {
            otherKey: 'val',
            hierarchicalMenu: { ok: 'yep', otherKey: 'val' },
          },
          second: { page: 1, hierarchicalMenu: { ok: 'yep' } },
        },
      });
    });
  });
});
