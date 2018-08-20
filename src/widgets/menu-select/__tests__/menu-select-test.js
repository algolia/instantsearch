import menuSelect from '../menu-select';

describe('menuSelect', () => {
  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(menuSelect.bind(null, { container })).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    const attributeName = 'categories';
    expect(menuSelect.bind(null, { attributeName })).toThrow(/^Usage/);
  });

  describe('render', () => {
    let ReactDOM;
    let data;
    let results;
    let state;
    let helper;

    beforeEach(() => {
      ReactDOM = { render: jest.fn() };
      menuSelect.__Rewire__('render', ReactDOM.render);

      data = { data: [{ name: 'foo' }, { name: 'bar' }] };
      results = { getFacetValues: jest.fn(() => data) };
      state = { toggleRefinement: jest.fn() };
      helper = {
        toggleRefinement: jest.fn().mockReturnThis(),
        search: jest.fn(),
        state,
      };
    });

    it('renders correctly', () => {
      const widget = menuSelect({
        container: document.createElement('div'),
        attributeName: 'test',
      });

      widget.init({ helper, createURL: () => '#', instantSearchInstance: {} });
      widget.render({ results, createURL: () => '#', state });

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('renders transformed items correctly', () => {
      const widget = menuSelect({
        container: document.createElement('div'),
        attributeName: 'test',
        transformItems: items =>
          items.map(item => ({ ...item, transformed: true })),
      });

      widget.init({ helper, createURL: () => '#', instantSearchInstance: {} });
      widget.render({ results, createURL: () => '#', state });

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    afterEach(() => {
      menuSelect.__ResetDependency__('render');
    });
  });
});
