import hitsPerPageSelector from '../hits-per-page-selector';

describe('hitsPerPageSelector call', () => {
  it('throws an exception when no items', () => {
    const container = document.createElement('div');
    expect(hitsPerPageSelector.bind(null, { container })).toThrow(/^Usage:/);
  });

  it('throws an exception when no container', () => {
    const items = { a: { value: 'value', label: 'My value' } };
    expect(hitsPerPageSelector.bind(null, { items })).toThrow(/^Usage:/);
  });
});

describe('hitsPerPageSelector()', () => {
  let ReactDOM;
  let container;
  let items;
  let cssClasses;
  let widget;
  let helper;
  let results;
  let consoleWarn;
  let state;

  beforeEach(() => {
    ReactDOM = { render: jest.fn() };

    hitsPerPageSelector.__Rewire__('render', ReactDOM.render);
    consoleWarn = jest.spyOn(window.console, 'warn');

    container = document.createElement('div');
    items = [
      { value: 10, label: '10 results' },
      { value: 20, label: '20 results' },
    ];
    cssClasses = {
      root: ['custom-root', 'cx'],
      select: 'custom-select',
      item: 'custom-item',
    };
    widget = hitsPerPageSelector({ container, items, cssClasses });
    helper = {
      state: {
        hitsPerPage: 20,
      },
      setQueryParameter: jest.fn().mockReturnThis(),
      search: jest.fn(),
    };
    state = {
      hitsPerPage: 10,
    };
    results = {
      hits: [],
      nbHits: 0,
    };
  });

  it('does not configure the default hits per page if not specified', () => {
    expect(typeof widget.getConfiguration).toEqual('function');
    expect(widget.getConfiguration()).toEqual({});
  });

  it('does configures the default hits per page if specified', () => {
    const widgetWithDefaults = hitsPerPageSelector({
      container: document.createElement('div'),
      items: [
        { value: 10, label: '10 results' },
        { value: 20, label: '20 results', default: true },
      ],
    });

    expect(widgetWithDefaults.getConfiguration()).toEqual({
      hitsPerPage: 20,
    });
  });

  it('calls twice ReactDOM.render(<Selector props />, container)', () => {
    widget.init({ helper, state: helper.state });
    widget.render({ results, state });
    widget.render({ results, state });
    expect(ReactDOM.render).toHaveBeenCalledTimes(2);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('renders transformed items', () => {
    widget = hitsPerPageSelector({
      container,
      items: [
        { value: 10, label: '10 results' },
        { value: 20, label: '20 results', default: true },
      ],
      transformItems: widgetItems =>
        widgetItems.map(item => ({ ...item, transformed: true })),
    });

    widget.init({ helper, state: helper.state });
    widget.render({ results, state });

    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('sets the underlying hitsPerPage', () => {
    widget.init({ helper, state: helper.state });
    widget.setHitsPerPage(helper, helper.state, 10);
    expect(helper.setQueryParameter).toHaveBeenCalledTimes(
      1,
      'setQueryParameter called once'
    );
    expect(helper.search).toHaveBeenCalledTimes(1, 'search called once');
  });

  it('should throw if there is no name attribute in a passed object', () => {
    items.length = 0;
    items.push({ label: 'Label without a value' });
    widget.init({ state: helper.state, helper });
    expect(consoleWarn).toHaveBeenCalledTimes(1, 'console.warn called once');
    expect(consoleWarn.mock.calls[0][0]).toEqual(
      `[Warning][hitsPerPageSelector] No item in \`items\`
  with \`value: hitsPerPage\` (hitsPerPage: 20)`
    );
  });

  it('must include the current hitsPerPage at initialization time', () => {
    helper.state.hitsPerPage = -1;
    widget.init({ state: helper.state, helper });
    expect(consoleWarn).toHaveBeenCalledTimes(1, 'console.warn called once');
    expect(consoleWarn.mock.calls[0][0]).toEqual(
      `[Warning][hitsPerPageSelector] No item in \`items\`
  with \`value: hitsPerPage\` (hitsPerPage: -1)`
    );
  });

  it('should not throw an error if state does not have a `hitsPerPage`', () => {
    delete helper.state.hitsPerPage;
    expect(() => {
      widget.init({ state: helper.state, helper });
    }).not.toThrow(/No item in `items`/);
  });

  afterEach(() => {
    hitsPerPageSelector.__ResetDependency__('render');
    consoleWarn.mockRestore();
  });
});
