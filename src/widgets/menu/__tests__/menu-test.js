import { render } from 'preact-compat';
import menu from '../menu';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

describe('menu', () => {
  it('throws without container', () => {
    expect(() => {
      menu({ attribute: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/menu/js/"
`);
  });

  describe('render', () => {
    let data;
    let results;
    let state;
    let helper;

    beforeEach(() => {
      data = { data: [{ name: 'foo' }, { name: 'bar' }] };
      results = { getFacetValues: jest.fn(() => data) };
      state = { toggleRefinement: jest.fn() };
      helper = {
        toggleRefinement: jest.fn().mockReturnThis(),
        search: jest.fn(),
        state,
      };

      render.mockClear();
    });

    it('snapshot', () => {
      const widget = menu({
        container: document.createElement('div'),
        attribute: 'test',
      });

      widget.init({
        helper,
        createURL: () => '#',
        instantSearchInstance: { templatesConfig: undefined },
      });
      widget.render({ results, state });

      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('renders transformed items', () => {
      const widget = menu({
        container: document.createElement('div'),
        attribute: 'test',
        transformItems: items =>
          items.map(item => ({ ...item, transformed: true })),
      });

      widget.init({
        helper,
        createURL: () => '#',
        instantSearchInstance: { templatesConfig: undefined },
      });
      widget.render({ results, state });

      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });
  });
});
