import jsHelper from 'algoliasearch-helper';
import ratingMenu from '../rating-menu.js';
import defaultLabels from '../../../widgets/rating-menu/defaultLabels.js';

const { SearchResults } = jsHelper;

describe('ratingMenu()', () => {
  const attribute = 'anAttrName';
  let ReactDOM;
  let container;
  let widget;
  let helper;
  let state;
  let createURL;

  let results;

  beforeEach(() => {
    ReactDOM = { render: jest.fn() };
    ratingMenu.__Rewire__('render', ReactDOM.render);

    container = document.createElement('div');
    widget = ratingMenu({
      container,
      attribute,
      cssClasses: { body: ['body', 'cx'] },
    });
    helper = jsHelper({}, '', widget.getConfiguration({}));
    jest.spyOn(helper, 'clearRefinements');
    jest.spyOn(helper, 'addDisjunctiveFacetRefinement');
    jest.spyOn(helper, 'getRefinements');
    helper.search = jest.fn();

    state = {
      toggleRefinement: jest.fn(),
    };
    results = {
      getFacetValues: jest.fn().mockReturnValue([]),
      hits: [],
    };
    createURL = () => '#';
    widget.init({
      helper,
      instantSearchInstance: { templatesConfig: undefined },
    });
  });

  it('configures the underlying disjunctive facet', () => {
    expect(widget.getConfiguration()).toEqual({
      disjunctiveFacets: ['anAttrName'],
    });
  });

  it('calls twice ReactDOM.render(<RefinementList props />, container)', () => {
    widget.render({ state, helper, results, createURL });
    widget.render({ state, helper, results, createURL });

    expect(ReactDOM.render).toHaveBeenCalledTimes(2);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);
    expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
  });

  it('hide the count==0 when there is a refinement', () => {
    helper.addDisjunctiveFacetRefinement(attribute, 1);
    const _results = new SearchResults(helper.state, [
      {
        facets: {
          [attribute]: { 1: 42 },
        },
      },
      {},
    ]);

    widget.render({ state, helper, results: _results, createURL });
    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0].props.facetValues).toEqual([
      {
        count: 42,
        isRefined: true,
        name: '1',
        value: '1',
        stars: [true, false, false, false, false],
        labels: defaultLabels,
      },
    ]);
  });

  it("doesn't call the refinement functions if not refined", () => {
    helper.getRefinements = jest.fn().mockReturnValue([]);
    widget.render({ state, helper, results, createURL });
    expect(helper.clearRefinements).toHaveBeenCalledTimes(0);
    expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledTimes(0);
    expect(helper.search).toHaveBeenCalledTimes(0);
  });

  it('refines the search', () => {
    helper.getRefinements = jest.fn().mockReturnValue([]);
    widget._toggleRefinement('3');
    expect(helper.clearRefinements).toHaveBeenCalledTimes(1);
    expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledTimes(3);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('toggles the refinements', () => {
    helper.addDisjunctiveFacetRefinement(attribute, 2);
    helper.addDisjunctiveFacetRefinement.mockReset();
    widget._toggleRefinement('2');
    expect(helper.clearRefinements).toHaveBeenCalledTimes(1);
    expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledTimes(0);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('toggles the refinements with another facet', () => {
    helper.getRefinements = jest.fn().mockReturnValue([{ value: '2' }]);
    widget._toggleRefinement('4');
    expect(helper.clearRefinements).toHaveBeenCalledTimes(1);
    expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledTimes(2);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('should return the right facet counts and results', () => {
    const _widget = ratingMenu({
      container,
      attribute,
      cssClasses: { body: ['body', 'cx'] },
    });
    const _helper = jsHelper({}, '', _widget.getConfiguration({}));
    _helper.search = jest.fn();

    _widget.init({
      helper: _helper,
      state: _helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
      instantSearchInstance: {
        templatesConfig: {},
      },
    });

    _widget.render({
      results: new SearchResults(_helper.state, [
        {
          facets: {
            [attribute]: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 },
          },
        },
        {},
      ]),
      state: _helper.state,
      helper: _helper,
      createURL: () => '#',
      instantSearchInstance: {
        templatesConfig: {},
      },
    });

    expect(
      ReactDOM.render.mock.calls[ReactDOM.render.mock.calls.length - 1][0].props
        .facetValues
    ).toEqual([
      {
        count: 1000,
        isRefined: false,
        labels: { andUp: '& Up' },
        name: '4',
        value: '4',
        stars: [true, true, true, true, false],
      },
      {
        count: 1050,
        isRefined: false,
        labels: { andUp: '& Up' },
        name: '3',
        value: '3',
        stars: [true, true, true, false, false],
      },
      {
        count: 1070,
        isRefined: false,
        labels: { andUp: '& Up' },
        name: '2',
        value: '2',
        stars: [true, true, false, false, false],
      },
      {
        count: 1080,
        isRefined: false,
        labels: { andUp: '& Up' },
        name: '1',
        value: '1',
        stars: [true, false, false, false, false],
      },
    ]);
  });

  afterEach(() => {
    ratingMenu.__ResetDependency__('render');
  });
});
