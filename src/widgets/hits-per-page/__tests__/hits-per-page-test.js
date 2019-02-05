import { render } from 'preact-compat';
import hitsPerPage from '../hits-per-page';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

describe('hitsPerPage call', () => {
  it('throws an exception when no items', () => {
    const container = document.createElement('div');
    expect(hitsPerPage.bind(null, { container })).toThrow(/^Usage:/);
  });

  it('throws an exception when no container', () => {
    const items = { a: { value: 'value', label: 'My value' } };
    expect(hitsPerPage.bind(null, { items })).toThrow(/^Usage:/);
  });
});

describe('hitsPerPage()', () => {
  let container;
  let items;
  let cssClasses;
  let widget;
  let helper;
  let results;
  let consoleWarn;
  let state;

  beforeEach(() => {
    consoleWarn = jest.spyOn(window.console, 'warn');

    container = document.createElement('div');
    items = [
      { value: 10, label: '10 results' },
      { value: 20, label: '20 results' },
    ];
    cssClasses = {
      root: ['custom-root', 'cx'],
      select: 'custom-select',
      option: 'custom-option',
    };
    widget = hitsPerPage({ container, items, cssClasses });
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

    render.mockClear();
  });

  it('does not configure the default hits per page if not specified', () => {
    expect(typeof widget.getConfiguration).toEqual('function');
    expect(widget.getConfiguration()).toEqual({});
  });

  it('does configures the default hits per page if specified', () => {
    const widgetWithDefaults = hitsPerPage({
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

  it('calls twice render(<Selector props />, container)', () => {
    widget.init({ helper, state: helper.state });
    widget.render({ results, state });
    widget.render({ results, state });
    expect(render).toHaveBeenCalledTimes(2);
    expect(render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('renders transformed items', () => {
    widget = hitsPerPage({
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

    expect(render.mock.calls[0][0]).toMatchSnapshot();
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
    expect(consoleWarn.mock.calls[0][0]).toMatchInlineSnapshot(
      `"[InstantSearch.js]: No items in HitsPerPage \`items\` with \`value: hitsPerPage\` (hitsPerPage: 20)"`
    );
  });

  it('must include the current hitsPerPage at initialization time', () => {
    helper.state.hitsPerPage = -1;
    widget.init({ state: helper.state, helper });
    expect(consoleWarn).toHaveBeenCalledTimes(1, 'console.warn called once');
    expect(consoleWarn.mock.calls[0][0]).toMatchInlineSnapshot(
      `"[InstantSearch.js]: No items in HitsPerPage \`items\` with \`value: hitsPerPage\` (hitsPerPage: -1)"`
    );
  });

  it('should not throw an error if state does not have a `hitsPerPage`', () => {
    delete helper.state.hitsPerPage;
    expect(() => {
      widget.init({ state: helper.state, helper });
    }).not.toThrow(/No item in `items`/);
  });

  afterEach(() => {
    consoleWarn.mockRestore();
  });
});
