import { render as preactRender, VNode } from 'preact';
import algoliasearchHelper, {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import rangeSlider from '../range-slider';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import { createRenderOptions } from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { InstantSearch } from '../../../types';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { castToJestMock } from '../../../../test/utils/castToJestMock';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

type SliderProps = {
  max: number;
  min: number;
  values: [number, number];
};

function createFacetStatsResults({
  helper,
  attribute,
  min,
  max,
}: {
  helper: AlgoliaSearchHelper;
  attribute: string;
  min: number;
  max: number;
}): SearchResults {
  return new SearchResults(helper.state, [
    createSingleSearchResponse({
      facets: { [attribute]: { [min]: 10000, [max]: 1 } },
      facets_stats: {
        [attribute]: {
          min,
          max,
          avg: min,
          sum: max,
        },
      },
    }),
  ]);
}

describe('rangeSlider', () => {
  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => rangeSlider({ container: undefined }))
        .toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/range-slider/js/"
`);
    });

    it('is a widget', () => {
      const container = document.createElement('div');
      const widget = rangeSlider({ container, attribute: 'price' });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.rangeSlider',
          $$widgetType: 'ais.rangeSlider',
        })
      );
    });
  });

  describe('Lifecycle', () => {
    const attribute = 'aNumAttr';

    let container: HTMLDivElement;
    let helper: AlgoliaSearchHelper;
    let widget;
    let instantSearchInstance: InstantSearch;

    beforeEach(() => {
      (render as jest.Mock).mockClear();

      container = document.createElement('div');
      helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        disjunctiveFacets: [attribute],
      });
      instantSearchInstance = createInstantSearch({
        templatesConfig: undefined,
      });
    });

    it('should render without results', () => {
      widget = rangeSlider({
        container,
        attribute,
        cssClasses: { root: ['root', 'cx'] },
        step: 1,
      });

      widget.init({ helper, instantSearchInstance });
      widget.render({ results: [], helper });

      const firstRender = render.mock.calls[0][0] as VNode;

      expect(render).toHaveBeenCalledTimes(1);
      expect(firstRender.props).toMatchSnapshot();
    });

    describe('min option', () => {
      it('refines when no previous configuration', () => {
        widget = rangeSlider({
          container,
          attribute,
          min: 100,
          step: 1,
          cssClasses: { root: '' },
        });

        expect(
          widget.getWidgetSearchParameters(new SearchParameters(), {
            uiState: {},
          })
        ).toEqual(
          new SearchParameters({
            disjunctiveFacets: [attribute],
            numericRefinements: { [attribute]: { '>=': [100] } },
          })
        );
      });

      it('works along with max option', () => {
        widget = rangeSlider({
          container,
          attribute,
          min: 100,
          max: 200,
          step: 1,
          cssClasses: { root: '' },
        });

        expect(
          widget.getWidgetSearchParameters(new SearchParameters(), {
            uiState: {},
          })
        ).toEqual(
          new SearchParameters({
            disjunctiveFacets: [attribute],
            numericRefinements: {
              [attribute]: {
                '>=': [100],
                '<=': [200],
              },
            },
          })
        );
      });

      it('sets the right range', () => {
        widget = rangeSlider({
          container,
          attribute,
          min: 100,
          max: 200,
          step: 1,
          cssClasses: { root: '' },
        });

        helper.setState(
          widget.getWidgetSearchParameters(new SearchParameters(), {
            uiState: {},
          })
        );
        widget.init({ helper, instantSearchInstance });
        widget.render({ results: {}, helper });

        const firstRender = render.mock.calls[0][0] as VNode;

        expect(render).toHaveBeenCalledTimes(1);
        expect(firstRender.props).toMatchSnapshot();
      });

      it('will use the results max when only min passed', () => {
        const results = {
          disjunctiveFacets: [
            {
              name: attribute,
              stats: {
                min: 1.99,
                max: 4999.98,
              },
            },
          ],
        };
        widget = rangeSlider({
          container,
          attribute,
          min: 100,
          step: 1,
          cssClasses: { root: '' },
        });

        helper.setState(
          widget.getWidgetSearchParameters(new SearchParameters(), {
            uiState: {},
          })
        );
        widget.init({ helper, instantSearchInstance });
        widget.render({ results, helper });

        expect(render).toHaveBeenCalledTimes(1);

        const firstRender = render.mock.calls[0][0] as VNode<SliderProps>;

        expect((firstRender.props as SliderProps).max).toEqual(5000);
        expect(firstRender.props).toMatchSnapshot();
      });
    });

    describe('max option', () => {
      it('refines when no previous configuration', () => {
        widget = rangeSlider({
          container,
          attribute,
          max: 100,
          step: 1,
          cssClasses: { root: '' },
        });

        expect(
          widget.getWidgetSearchParameters(new SearchParameters(), {
            uiState: {},
          })
        ).toEqual(
          new SearchParameters({
            disjunctiveFacets: [attribute],
            numericRefinements: { [attribute]: { '<=': [100] } },
          })
        );
      });

      it('will use the results min when only max is passed', () => {
        const results = {
          disjunctiveFacets: [
            {
              name: attribute,
              stats: {
                min: 1.99,
                max: 4999.98,
              },
            },
          ],
        };

        widget = rangeSlider({
          container,
          attribute,
          max: 100,
          step: 1,
          cssClasses: { root: '' },
        });
        helper.setState(
          widget.getWidgetSearchParameters(new SearchParameters(), {
            uiState: {},
          })
        );
        widget.init({ helper, instantSearchInstance });
        widget.render({ results, helper });

        expect(render).toHaveBeenCalledTimes(1);

        const firstRender = render.mock.calls[0][0] as VNode<SliderProps>;
        expect((firstRender.props as SliderProps).min).toEqual(1);
        expect(firstRender.props).toMatchSnapshot();
      });
    });

    describe('with results', () => {
      let results: SearchResults;

      beforeEach(() => {
        widget = rangeSlider({
          container,
          attribute,
          step: 1,
          cssClasses: { root: '' },
        });
        widget.init({ helper, instantSearchInstance });

        results = createFacetStatsResults({
          helper,
          attribute,
          min: 1.99,
          max: 4999.98,
        });

        helper.search = jest.fn();
      });

      it('configures the disjunctiveFacets', () => {
        expect(
          widget.getWidgetSearchParameters(new SearchParameters(), {
            uiState: {},
          })
        ).toEqual(
          new SearchParameters({
            disjunctiveFacets: ['aNumAttr'],
            // @TODO: gWSP does not yet take min & max in account (so is this correct?)
            numericRefinements: {
              aNumAttr: {},
            },
          })
        );
      });

      it('calls twice render', () => {
        widget.render({ results, helper });
        widget.render({ results, helper });

        const firstRender = render.mock.calls[0][0] as VNode;
        const secondRender = render.mock.calls[1][0] as VNode;

        expect(render).toHaveBeenCalledTimes(2);
        expect(firstRender.props).toMatchSnapshot();
        expect(secondRender.props).toMatchSnapshot();
      });

      it('does not call the refinement functions if not refined', () => {
        const state0 = helper.state;
        widget.render({ results, helper });
        const state1 = helper.state;

        expect(state0).toEqual(state1);
        expect(helper.search).not.toHaveBeenCalled();
      });

      it('calls the refinement function if refined with min+1', () => {
        const [{ stats }] = results.disjunctiveFacets;

        const { refine } = widget.getWidgetRenderState(
          createRenderOptions({
            helper,
            results,
          })
        );

        const state0 = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });
        helper.setState(state0);
        refine([stats!.min + 1, stats!.max]);
        const state1 = helper.state;

        expect(helper.search).toHaveBeenCalledTimes(1);
        expect(state1).toEqual(state0.addNumericRefinement(attribute, '>=', 2));
      });

      it('calls the refinement function if refined with max-1', () => {
        const [{ stats }] = results.disjunctiveFacets;

        const { refine } = widget.getWidgetRenderState(
          createRenderOptions({
            helper,
            results,
            instantSearchInstance,
          })
        );

        const state0 = widget.getWidgetSearchParameters(helper.state, {
          uiState: {},
        });
        helper.setState(state0);
        refine([stats!.min, stats!.max - 1]);
        const state1 = helper.state;

        expect(helper.search).toHaveBeenCalledTimes(1);
        expect(state1).toEqual(
          state0.addNumericRefinement(attribute, '<=', 4999)
        );
      });

      it('calls the refinement function if refined with min+1 and max-1', () => {
        const [{ stats }] = results.disjunctiveFacets;

        const { refine } = widget.getWidgetRenderState(
          createRenderOptions({
            helper,
            results,
          })
        );

        const state0 = helper.state;
        refine([stats!.min + 1, stats!.max - 1]);
        const state1 = helper.state;

        expect(helper.search).toHaveBeenCalledTimes(1);
        expect(state1).toEqual(
          state0
            .addNumericRefinement(attribute, '>=', 2)
            .addNumericRefinement(attribute, '<=', 4999)
        );
      });

      it("expect to clamp the min value to the max range when it's greater than range", () => {
        widget = rangeSlider({
          container,
          attribute,
          step: 1,
          cssClasses: { root: '' },
        });

        widget.init({ helper, instantSearchInstance });

        helper.addNumericRefinement(attribute, '>=', 5550);
        helper.addNumericRefinement(attribute, '<=', 6000);

        widget.render({ results, helper });

        const firstRender = render.mock.calls[0][0] as VNode<SliderProps>;

        expect((firstRender.props as SliderProps).values[0]).toBe(5000);
      });

      it("expect to clamp the max value to the min range when it's lower than range", () => {
        widget = rangeSlider({
          container,
          attribute,
          step: 1,
          cssClasses: { root: '' },
        });

        widget.init({ helper, instantSearchInstance });

        helper.addNumericRefinement(attribute, '>=', -50);
        helper.addNumericRefinement(attribute, '<=', 0);

        widget.render({ results, helper });

        const firstRender = render.mock.calls[0][0] as VNode<SliderProps>;

        expect((firstRender.props as SliderProps).values[1]).toBe(1);
      });
    });
  });
});
