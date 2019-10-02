import { render } from 'preact';
import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import ratingMenu from '../rating-menu';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      ratingMenu({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/rating-menu/js/"
`);
  });
});

describe('ratingMenu()', () => {
  const attribute = 'anAttrName';
  let container;
  let widget;
  let helper;
  let state;
  let createURL;
  let results;

  beforeEach(() => {
    render.mockClear();

    container = document.createElement('div');
    widget = ratingMenu({
      container,
      attribute,
      cssClasses: { body: ['body', 'cx'] },
    });
    helper = jsHelper(
      {},
      '',
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    jest.spyOn(helper, 'clearRefinements');
    jest.spyOn(helper, 'addDisjunctiveFacetRefinement');
    jest.spyOn(helper, 'getRefinements');
    jest.spyOn(helper, 'removeDisjunctiveFacetRefinement');
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
    expect(
      widget.getWidgetSearchParameters(new SearchParameters(), { uiState: {} })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['anAttrName'],
        disjunctiveFacetsRefinements: {
          anAttrName: [],
        },
      })
    );
  });

  it('calls twice render(<RefinementList props />, container)', () => {
    widget.render({ state, helper, results, createURL });
    widget.render({ state, helper, results, createURL });

    const [firstRender, secondRender] = render.mock.calls;

    const { children, ...rootProps } = firstRender[0].props;

    expect(render).toHaveBeenCalledTimes(2);
    expect(rootProps).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[1]).toEqual(container);
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

    const [firstRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender[0].props.facetValues).toEqual([
      {
        count: 42,
        isRefined: true,
        name: '1',
        value: '1',
        stars: [true, false, false, false, false],
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

    expect(helper.removeDisjunctiveFacetRefinement).toHaveBeenCalledTimes(1);
    expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledTimes(3);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('toggles the refinements', () => {
    helper.addDisjunctiveFacetRefinement(attribute, 2);
    helper.addDisjunctiveFacetRefinement.mockReset();
    widget._toggleRefinement('2');

    expect(helper.removeDisjunctiveFacetRefinement).toHaveBeenCalledTimes(1);
    expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledTimes(0);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('toggles the refinements with another facet', () => {
    helper.getRefinements = jest.fn().mockReturnValue([{ value: '2' }]);
    widget._toggleRefinement('4');

    expect(helper.removeDisjunctiveFacetRefinement).toHaveBeenCalledTimes(1);
    expect(helper.addDisjunctiveFacetRefinement).toHaveBeenCalledTimes(2);
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('should return the right facet counts and results', () => {
    const _widget = ratingMenu({
      container,
      attribute,
      cssClasses: { body: ['body', 'cx'] },
    });
    const _helper = jsHelper(
      {},
      '',
      _widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    );
    _helper.search = jest.fn();

    _widget.init({
      helper: _helper,
      state: _helper.state,
      createURL: () => '#',
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
      render.mock.calls[render.mock.calls.length - 1][0].props.facetValues
    ).toEqual([
      {
        count: 1000,
        isRefined: false,

        name: '4',
        value: '4',
        stars: [true, true, true, true, false],
      },
      {
        count: 1050,
        isRefined: false,

        name: '3',
        value: '3',
        stars: [true, true, true, false, false],
      },
      {
        count: 1070,
        isRefined: false,

        name: '2',
        value: '2',
        stars: [true, true, false, false, false],
      },
      {
        count: 1080,
        isRefined: false,

        name: '1',
        value: '1',
        stars: [true, false, false, false, false],
      },
    ]);
  });
});
