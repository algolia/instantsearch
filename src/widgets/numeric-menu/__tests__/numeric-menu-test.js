import numericMenu from '../numeric-menu';

const encodeValue = (start, end) =>
  window.encodeURI(JSON.stringify({ start, end }));

describe('numericMenu call', () => {
  it('throws an exception when no container', () => {
    const attribute = '';
    const items = [];
    expect(numericMenu.bind(null, { attribute, items })).toThrow(/^Usage/);
  });

  it('throws an exception when no attribute', () => {
    const container = document.createElement('div');
    const items = [];
    expect(numericMenu.bind(null, { container, items })).toThrow(/^Usage/);
  });

  it('throws an exception when no items', () => {
    const container = document.createElement('div');
    const attribute = '';
    expect(numericMenu.bind(null, { attribute, container })).toThrow(/^Usage/);
  });
});

describe('numericMenu()', () => {
  let ReactDOM;
  let container;
  let widget;
  let helper;

  let items;
  let results;
  let createURL;
  let state;

  beforeEach(() => {
    ReactDOM = { render: jest.fn() };
    numericMenu.__Rewire__('render', ReactDOM.render);

    items = [
      { label: 'All' },
      { end: 4, label: 'less than 4' },
      { start: 4, end: 4, label: '4' },
      { start: 5, end: 10, label: 'between 5 and 10' },
      { start: 10, label: 'more than 10' },
    ];

    container = document.createElement('div');
    widget = numericMenu({
      container,
      attribute: 'price',
      items,
      cssClasses: { root: ['root', 'cx'] },
    });
    helper = {
      state: {
        getNumericRefinements: jest.fn().mockReturnValue([]),
      },
      addNumericRefinement: jest.fn(),
      search: jest.fn(),
      setState: jest.fn().mockReturnThis(),
    };
    state = {
      getNumericRefinements: jest.fn().mockReturnValue([]),
      clearRefinements: jest.fn().mockReturnThis(),
      addNumericRefinement: jest.fn().mockReturnThis(),
    };
    results = {
      hits: [],
    };

    helper.state.clearRefinements = jest.fn().mockReturnValue(helper.state);
    helper.state.addNumericRefinement = jest.fn().mockReturnValue(helper.state);
    createURL = () => '#';
    widget.init({ helper, instantSearchInstance: {} });
  });

  it('calls twice ReactDOM.render(<RefinementList props />, container)', () => {
    widget.render({ state, results, createURL });
    widget.render({ state, results, createURL });

    expect(ReactDOM.render).toHaveBeenCalledTimes(2);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);
    expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
  });

  it('renders with transformed items', () => {
    widget = numericMenu({
      container,
      attribute: 'price',
      items,
      transformItems: allItems =>
        allItems.map(item => ({ ...item, transformed: true })),
    });

    widget.init({ helper, instantSearchInstance: {} });
    widget.render({ state, results, createURL });

    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  });

  it("doesn't call the refinement functions if not refined", () => {
    widget.render({ state, results, createURL });
    expect(helper.state.clearRefinements).toHaveBeenCalledTimes(
      0,
      'clearRefinements called one'
    );
    expect(helper.state.addNumericRefinement).toHaveBeenCalledTimes(
      0,
      'addNumericRefinement never called'
    );
    expect(helper.search).toHaveBeenCalledTimes(0, 'search never called');
  });

  it('calls the refinement functions if refined with "4"', () => {
    widget._refine(encodeValue(4, 4));
    expect(helper.state.clearRefinements).toHaveBeenCalledTimes(
      1,
      'clearRefinements called once'
    );
    expect(helper.state.addNumericRefinement).toHaveBeenCalledTimes(
      1,
      'addNumericRefinement called once'
    );
    expect(helper.state.addNumericRefinement).toHaveBeenNthCalledWith(
      1,
      'price',
      '=',
      4
    );
    expect(helper.search).toHaveBeenCalledTimes(1, 'search called once');
  });

  it('calls the refinement functions if refined with "between 5 and 10"', () => {
    widget._refine(encodeValue(5, 10));
    expect(helper.state.clearRefinements).toHaveBeenCalledTimes(
      1,
      'clearRefinements called once'
    );
    expect(helper.state.addNumericRefinement).toHaveBeenCalledTimes(
      2,
      'addNumericRefinement called twice'
    );
    expect(helper.state.addNumericRefinement).toHaveBeenNthCalledWith(
      1,
      'price',
      '>=',
      5
    );
    expect(helper.state.addNumericRefinement).toHaveBeenNthCalledWith(
      2,
      'price',
      '<=',
      10
    );
    expect(helper.search).toHaveBeenCalledTimes(1, 'search called once');
  });

  it('calls two times the refinement functions if refined with "less than 4"', () => {
    widget._refine(encodeValue(undefined, 4));
    expect(helper.state.clearRefinements).toHaveBeenCalledTimes(
      1,
      'clearRefinements called once'
    );
    expect(helper.state.addNumericRefinement).toHaveBeenCalledTimes(
      1,
      'addNumericRefinement called once'
    );
    expect(helper.state.addNumericRefinement).toHaveBeenNthCalledWith(
      1,
      'price',
      '<=',
      4
    );
    expect(helper.search).toHaveBeenCalledTimes(1, 'search called once');
  });

  it('calls two times the refinement functions if refined with "more than 10"', () => {
    widget._refine(encodeValue(10));
    expect(helper.state.clearRefinements).toHaveBeenCalledTimes(
      1,
      'clearRefinements called once'
    );
    expect(helper.state.addNumericRefinement).toHaveBeenCalledTimes(
      1,
      'addNumericRefinement called once'
    );
    expect(helper.state.addNumericRefinement).toHaveBeenNthCalledWith(
      1,
      'price',
      '>=',
      10
    );
    expect(helper.search).toHaveBeenCalledTimes(1, 'search called once');
  });

  it('does not alter the initial items when rendering', () => {
    // Note: https://github.com/algolia/instantsearch.js/issues/1010
    // Make sure we work on a copy of the initial facetValues when rendering,
    // not directly editing it

    // Given
    const initialOptions = [{ start: 0, end: 5, label: '1-5' }];
    const initialOptionsClone = [...initialOptions];
    const testWidget = numericMenu({
      container,
      attribute: 'price',
      items: initialOptions,
    });

    // The life cycle impose all the steps
    testWidget.init({ helper, createURL: () => '', instantSearchInstance: {} });

    // When
    testWidget.render({ state, results, createURL });

    // Then
    expect(initialOptions).toEqual(initialOptionsClone);
  });

  afterEach(() => {
    numericMenu.__ResetDependency__('render');
  });
});
