import { render } from 'preact-compat';
import menuSelect from '../menu-select';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

describe('menuSelect', () => {
  it('throws an exception when no attribute', () => {
    const container = document.createElement('div');
    expect(menuSelect.bind(null, { container })).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    const attribute = 'categories';
    expect(menuSelect.bind(null, { attribute })).toThrow(/^Usage/);
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

    it('renders correctly', () => {
      const widget = menuSelect({
        container: document.createElement('div'),
        attribute: 'test',
      });

      widget.init({ helper, createURL: () => '#', instantSearchInstance: {} });
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

      widget.init({ helper, createURL: () => '#', instantSearchInstance: {} });
      widget.render({ results, createURL: () => '#', state });

      expect(render.mock.calls[0][0]).toMatchSnapshot();
    });
  });
});
