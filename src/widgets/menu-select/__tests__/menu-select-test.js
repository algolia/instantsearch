import { render } from 'preact';
import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import menuSelect from '../menu-select';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('menuSelect', () => {
  describe('Usage', () => {
    it('throws without container ', () => {
      expect(() => {
        menuSelect({ container: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/menu-select/js/"
`);
    });
  });

  describe('Lifecycle', () => {
    let data;
    let results;
    let state;
    let helper;

    beforeEach(() => {
      data = { data: [{ name: 'foo' }, { name: 'bar' }] };
      results = { getFacetValues: jest.fn(() => data) };
      helper = algoliasearchHelper({}, 'index_name');
      helper.search = jest.fn();
      state = helper.state;

      render.mockClear();
    });

    describe('render', () => {
      it('renders correctly', () => {
        const widget = menuSelect({
          container: document.createElement('div'),
          attribute: 'test',
        });

        widget.init({
          helper,
          createURL: () => '#',
          instantSearchInstance: {},
        });
        widget.render({ results, createURL: () => '#', state });

        const [firstRender] = render.mock.calls;

        expect(firstRender[0].props).toMatchSnapshot();
      });

      it('renders transformed items correctly', () => {
        const widget = menuSelect({
          container: document.createElement('div'),
          attribute: 'test',
          transformItems: items =>
            items.map(item => ({ ...item, transformed: true })),
        });

        widget.init({
          helper,
          createURL: () => '#',
          instantSearchInstance: {},
        });
        widget.render({ results, createURL: () => '#', state });

        const [firstRender] = render.mock.calls;

        expect(firstRender[0].props).toMatchSnapshot();
      });
    });

    describe('dispose', () => {
      it('unmounts the component', () => {
        const container = document.createElement('div');
        const widget = menuSelect({
          attribute: 'test',
          container,
        });

        helper.setState(
          widget.getWidgetSearchParameters(new SearchParameters({}), {
            uiState: {
              menu: {
                amazingBrand: 'algolia',
              },
            },
          })
        );

        expect(helper.state).toEqual(
          new SearchParameters({
            hierarchicalFacets: [{ attributes: ['test'], name: 'test' }],
            hierarchicalFacetsRefinements: { test: [] },
            maxValuesPerFacet: 10,
          })
        );

        expect(render).toHaveBeenCalledTimes(0);

        const newState = widget.dispose({
          state: helper.state,
          helper,
        });

        expect(render).toHaveBeenCalledTimes(1);
        expect(render).toHaveBeenLastCalledWith(null, container);
        expect(newState).toEqual(new SearchParameters());
      });
    });
  });
});
