import menu from '../menu';

describe('menu', () => {
  it('throws an exception when no attribute', () => {
    const container = document.createElement('div');
    expect(menu.bind(null, { container })).toThrow(/^Usage/);
  });

  it('throws an exception when no container', () => {
    expect(menu.bind(null, { attribute: '' })).toThrow(/^Usage/);
  });

  it('throws an exception when showMoreLimit without showMore option', () => {
    const container = document.createElement('div');
    expect(
      menu.bind(null, { attribute: 'attribute', container, showMoreLimit: 10 })
    ).toThrowErrorMatchingInlineSnapshot(
      `"\`showMoreLimit\` must be used with \`showMore\` set to \`true\`."`
    );
  });

  it('throws an exception when showMoreLimit is lower than limit', () => {
    const container = document.createElement('div');
    expect(
      menu.bind(null, {
        attribute: 'attribute',
        container,
        limit: 20,
        showMore: true,
        showMoreLimit: 10,
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"\`showMoreLimit\` should be greater than \`limit\`."`
    );
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
      state = { toggleFacetRefinement: jest.fn() };
      helper = {
        toggleFacetRefinement: jest.fn().mockReturnThis(),
        search: jest.fn(),
        state,
      };
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

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
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

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    afterEach(() => {
      menu.__ResetDependency__('render');
    });
  });
});
