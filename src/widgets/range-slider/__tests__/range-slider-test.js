import { render } from 'preact';
import AlgoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import rangeSlider from '../range-slider';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

const instantSearchInstance = { templatesConfig: undefined };

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
        })
      );
    });
  });

  describe('Lifecycle', () => {
    const attribute = 'aNumAttr';

    let container;
    let helper;
    let widget;

    beforeEach(() => {
      render.mockClear();

      container = document.createElement('div');
      helper = new AlgoliasearchHelper(
        {
          search() {
            return Promise.resolve({ results: [{}] });
          },
        },
        'indexName',
        { disjunctiveFacets: ['aNumAttr'] }
      );
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

      const [firstRender] = render.mock.calls;

      expect(render).toHaveBeenCalledTimes(1);
      expect(firstRender[0].props).toMatchSnapshot();
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

        const [firstRender] = render.mock.calls;

        expect(render).toHaveBeenCalledTimes(1);
        expect(firstRender[0].props).toMatchSnapshot();
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

        const [firstRender] = render.mock.calls;

        expect(render).toHaveBeenCalledTimes(1);
        expect(firstRender[0].props.max).toEqual(5000);
        expect(firstRender[0].props).toMatchSnapshot();
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

        const [firstRender] = render.mock.calls;

        expect(render).toHaveBeenCalledTimes(1);
        expect(firstRender[0].props.min).toEqual(1);
        expect(firstRender[0].props).toMatchSnapshot();
      });
    });

    describe('with results', () => {
      let results;

      beforeEach(() => {
        widget = rangeSlider({
          container,
          attribute,
          step: 1,
          cssClasses: { root: '' },
        });
        widget.init({ helper, instantSearchInstance });

        results = {
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

        const [firstRender, secondRender] = render.mock.calls;

        expect(render).toHaveBeenCalledTimes(2);
        expect(firstRender[0].props).toMatchSnapshot();
        expect(secondRender[0].props).toMatchSnapshot();
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
        const targetValue = stats.min + 1;

        const state0 = helper.state;
        widget._refine(helper, stats)([targetValue, stats.max]);
        const state1 = helper.state;

        expect(helper.search).toHaveBeenCalledTimes(1);
        expect(state1).toEqual(state0.addNumericRefinement(attribute, '>=', 3));
      });

      it('calls the refinement function if refined with max-1', () => {
        const [{ stats }] = results.disjunctiveFacets;
        const targetValue = stats.max - 1;

        const state0 = helper.state;
        widget._refine(helper, stats)([stats.min, targetValue]);
        const state1 = helper.state;

        expect(helper.search).toHaveBeenCalledTimes(1);
        expect(state1).toEqual(
          state0.addNumericRefinement(attribute, '<=', 4999)
        );
      });

      it('calls the refinement function if refined with min+1 and max-1', () => {
        const [{ stats }] = results.disjunctiveFacets;
        const targetValue = [stats.min + 1, stats.max - 1];

        const state0 = helper.state;
        widget._refine(helper, stats)(targetValue);
        const state1 = helper.state;

        expect(helper.search).toHaveBeenCalledTimes(1);
        expect(state1).toEqual(
          state0
            .addNumericRefinement(attribute, '>=', 3)
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

        const [firstRender] = render.mock.calls;

        expect(firstRender[0].props.values[0]).toBe(5000);
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

        const [firstRender] = render.mock.calls;

        expect(firstRender[0].props.values[1]).toBe(1);
      });
    });
  });
});
