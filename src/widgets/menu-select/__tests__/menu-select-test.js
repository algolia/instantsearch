import { render, unmountComponentAtNode } from 'preact-compat';
import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import menuSelect from '../menu-select';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();
  module.unmountComponentAtNode = jest.fn();

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

        expect(render.mock.calls[0][0]).toMatchSnapshot();
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

        expect(render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('dispose', () => {
      it('unmounts the component', () => {
        const container = document.createElement('div');
        const widget = menuSelect({
          attribute: 'test',
          container,
        });

        helper.setState(widget.getConfiguration(new SearchParameters({})));

        expect(unmountComponentAtNode).toHaveBeenCalledTimes(0);

        widget.dispose({
          state: helper.state,
          helper,
        });

        expect(unmountComponentAtNode).toHaveBeenCalledTimes(1);
        expect(unmountComponentAtNode).toHaveBeenCalledWith(container);
      });
    });
  });
});
