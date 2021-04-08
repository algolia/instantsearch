import { render as preactRender, VNode } from 'preact';
import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import ratingMenu from '../rating-menu';
import { castToJestMock } from '../../../../test/utils/castToJestMock';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-expect-error
      ratingMenu({ container: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/rating-menu/js/"
`);
  });
});

describe('ratingMenu()', () => {
  const attribute = 'anAttrName';
  let container: HTMLDivElement;
  let widget: ReturnType<typeof ratingMenu>;
  let helper: jsHelper.AlgoliaSearchHelper;
  let createURL: () => string;
  let results: SearchResults;

  beforeEach(() => {
    render.mockClear();

    container = document.createElement('div');
    widget = ratingMenu({
      container,
      attribute,
    });
    helper = jsHelper(
      createSearchClient(),
      '',
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    jest.spyOn(helper, 'clearRefinements');
    jest.spyOn(helper, 'addNumericRefinement');
    jest.spyOn(helper, 'getRefinements');
    jest.spyOn(helper, 'removeNumericRefinement');
    helper.search = jest.fn();

    results = new SearchResults(helper.state, [createSingleSearchResponse()]);
    createURL = () => '#';
    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        instantSearchInstance: createInstantSearch({
          templatesConfig: undefined,
        }),
      })
    );
  });

  it('configures the underlying disjunctive facet', () => {
    expect(
      widget.getWidgetSearchParameters!(new SearchParameters(), { uiState: {} })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['anAttrName'],
        numericRefinements: {
          anAttrName: {},
        },
      })
    );
  });

  it('calls twice render(<RefinementList props />, container)', () => {
    widget.render!(
      createRenderOptions({ state: helper.state, helper, results, createURL })
    );
    widget.render!(
      createRenderOptions({ state: helper.state, helper, results, createURL })
    );

    const [firstRender, secondRender] = render.mock.calls;

    const { children, ...rootProps } = (firstRender[0] as VNode<any>).props;

    expect(render).toHaveBeenCalledTimes(2);
    expect(rootProps).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[1]).toEqual(container);
  });

  it('hide the count==0 when there is a refinement', () => {
    helper.addNumericRefinement(attribute, '>=', 1);
    const _results = new SearchResults(helper.state, [
      createSingleSearchResponse({
        facets: {
          [attribute]: { 1: 42 },
        },
      }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        helper,
        results: _results,
        createURL,
      })
    );

    const [firstRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(1);
    expect((firstRender[0] as VNode<any>).props.facetValues).toEqual([
      {
        count: 42,
        isRefined: true,
        name: '1',
        label: '1',
        value: '1',
        stars: [true, false, false, false, false],
      },
    ]);
  });

  it("doesn't call the refinement functions if not refined", () => {
    helper.getRefinements = jest.fn().mockReturnValue([]);
    widget.render!(
      createRenderOptions({ state: helper.state, helper, results, createURL })
    );

    expect(helper.clearRefinements).toHaveBeenCalledTimes(0);
    expect(helper.addNumericRefinement).toHaveBeenCalledTimes(0);
    expect(helper.search).toHaveBeenCalledTimes(0);
  });

  it('refines the search', () => {
    helper.getRefinements = jest.fn().mockReturnValue([]);
    widget
      .getWidgetRenderState(
        createRenderOptions({ state: helper.state, helper, results, createURL })
      )
      .refine('3');

    expect(helper.state).toEqual(
      new SearchParameters({
        index: '',
        disjunctiveFacets: ['anAttrName'],
        numericRefinements: {
          anAttrName: {
            '<=': [5],
            '>=': [3],
          },
        },
      })
    );
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('toggles the refinements', () => {
    helper.addNumericRefinement(attribute, '>=', 2);
    (helper.addNumericRefinement as jest.Mock).mockReset();
    widget
      .getWidgetRenderState(
        createRenderOptions({ state: helper.state, helper, results, createURL })
      )
      .refine('2');

    expect(helper.state).toEqual(
      new SearchParameters({
        index: '',
        disjunctiveFacets: ['anAttrName'],
        numericRefinements: {
          anAttrName: {
            '>=': [],
          },
        },
      })
    );
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('toggles the refinements with another facet', () => {
    helper.getRefinements = jest.fn().mockReturnValue([{ value: '2' }]);
    widget
      .getWidgetRenderState(
        createRenderOptions({ state: helper.state, helper, results, createURL })
      )
      .refine('4');

    expect(helper.state).toEqual(
      new SearchParameters({
        index: '',
        disjunctiveFacets: ['anAttrName'],
        numericRefinements: {
          anAttrName: {
            '<=': [5],
            '>=': [4],
          },
        },
      })
    );
    expect(helper.search).toHaveBeenCalledTimes(1);
  });

  it('should return the right facet counts and results', () => {
    const _widget = ratingMenu({
      container,
      attribute,
    });
    const _helper = jsHelper(
      createSearchClient(),
      '',
      _widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    );
    _helper.search = jest.fn();

    _widget.init!(
      createInitOptions({
        helper: _helper,
        state: _helper.state,
        createURL: () => '#',
        instantSearchInstance: createInstantSearch({
          templatesConfig: {},
        }),
      })
    );

    _widget.render!(
      createRenderOptions({
        results: new SearchResults(_helper.state, [
          createSingleSearchResponse({
            facets: {
              [attribute]: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 },
            },
          }),
        ]),
        state: _helper.state,
        helper: _helper,
        createURL: () => '#',
        instantSearchInstance: createInstantSearch({
          templatesConfig: {},
        }),
      })
    );

    expect(
      (render.mock.calls[render.mock.calls.length - 1][0] as VNode<any>).props
        .facetValues
    ).toEqual([
      {
        count: 1000,
        isRefined: false,

        name: '4',
        label: '4',
        value: '4',
        stars: [true, true, true, true, false],
      },
      {
        count: 1050,
        isRefined: false,

        name: '3',
        label: '3',
        value: '3',
        stars: [true, true, true, false, false],
      },
      {
        count: 1070,
        isRefined: false,

        name: '2',
        label: '2',
        value: '2',
        stars: [true, true, false, false, false],
      },
      {
        count: 1080,
        isRefined: false,

        name: '1',
        label: '1',
        value: '1',
        stars: [true, false, false, false, false],
      },
    ]);
  });
});
