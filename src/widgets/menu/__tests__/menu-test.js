import menu from '../menu';

describe('menu', () => {
  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(menu.bind(null, { container })).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    const attributeName = '';
    expect(menu.bind(null, { attributeName })).toThrow(/^Usage/);
  });

  describe('render', () => {
    let ReactDOM;
    let data;
    let results;
    let state;
    let helper;

    beforeEach(() => {
      ReactDOM = { render: jest.fn() };
      menu.__Rewire__('render', ReactDOM.render);

      data = { data: [{ name: 'foo' }, { name: 'bar' }] };
      results = { getFacetValues: jest.fn(() => data) };
      state = { toggleRefinement: jest.fn() };
      helper = {
        toggleRefinement: jest.fn().mockReturnThis(),
        search: jest.fn(),
        state,
      };
    });

    it('snapshot', () => {
      const widget = menu({
        container: document.createElement('div'),
        attributeName: 'test',
      });

      widget.init({
        helper,
        createURL: () => '#',
        instantSearchInstance: { templatesConfig: undefined },
      });
      widget.render({ results, state });

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    it('renders transformed items', () => {
      const widget = menu({
        container: document.createElement('div'),
        attributeName: 'test',
        transformItems: items =>
          items.map(item => ({ ...item, transformed: true })),
      });

      widget.init({
        helper,
        createURL: () => '#',
        instantSearchInstance: { templatesConfig: undefined },
      });
      widget.render({ results, state });

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    afterEach(() => {
      menu.__ResetDependency__('render');
    });
  });
});
