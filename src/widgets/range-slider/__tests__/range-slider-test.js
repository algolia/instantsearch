import AlgoliasearchHelper from 'algoliasearch-helper';

import rangeSlider from '../range-slider.js';

const instantSearchInstance = { templatesConfig: undefined };

describe('rangeSlider', () => {
  it('throws an exception when no container', () => {
    const attribute = '';
    expect(() => rangeSlider({ attribute })).toThrow(/^Usage:/);
  });

  it('throws an exception when no attribute', () => {
    const container = document.createElement('div');
    expect(() => rangeSlider({ container })).toThrow(/^Usage:/);
  });

  describe('widget usage', () => {
    const attribute = 'aNumAttr';

    let ReactDOM;
    let container;
    let helper;
    let widget;

    beforeEach(() => {
      ReactDOM = { render: jest.fn() };
      rangeSlider.__Rewire__('render', ReactDOM.render);

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

    afterEach(() => {
      rangeSlider.__ResetDependency__('render');
    });

    it('should render without results', () => {
      widget = rangeSlider({
        container,
        attribute,
        cssClasses: { root: ['root', 'cx'] },
      });

      widget.init({ helper, instantSearchInstance });
      widget.render({ results: [], helper });

      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    });

    describe('min option', () => {
      it('refines when no previous configuration', () => {
        widget = rangeSlider({ container, attribute, min: 100 });
        expect(widget.getConfiguration()).toEqual({
          disjunctiveFacets: [attribute],
          numericRefinements: { [attribute]: { '>=': [100] } },
        });
      });

      it('does not refine when previous configuration', () => {
        widget = rangeSlider({
          container,
          attribute: 'aNumAttr',
          min: 100,
        });
        expect(
          widget.getConfiguration({
            numericRefinements: { [attribute]: {} },
          })
        ).toEqual({
          disjunctiveFacets: [attribute],
        });
      });

      it('works along with max option', () => {
        widget = rangeSlider({ container, attribute, min: 100, max: 200 });
        expect(widget.getConfiguration()).toEqual({
          disjunctiveFacets: [attribute],
          numericRefinements: {
            [attribute]: {
              '>=': [100],
              '<=': [200],
            },
          },
        });
      });

      it('sets the right range', () => {
        widget = rangeSlider({ container, attribute, min: 100, max: 200 });
        helper.setState(widget.getConfiguration());
        widget.init({ helper, instantSearchInstance });
        widget.render({ results: {}, helper });

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
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

        widget = rangeSlider({ container, attribute, min: 100 });
        helper.setState(widget.getConfiguration());
        widget.init({ helper, instantSearchInstance });
        widget.render({ results, helper });

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0].props.max).toEqual(5000);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('max option', () => {
      it('refines when no previous configuration', () => {
        widget = rangeSlider({ container, attribute, max: 100 });
        expect(widget.getConfiguration()).toEqual({
          disjunctiveFacets: [attribute],
          numericRefinements: { [attribute]: { '<=': [100] } },
        });
      });

      it('does not refine when previous configuration', () => {
        widget = rangeSlider({ container, attribute, max: 100 });
        expect(
          widget.getConfiguration({
            numericRefinements: { [attribute]: {} },
          })
        ).toEqual({
          disjunctiveFacets: [attribute],
        });
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

        widget = rangeSlider({ container, attribute, max: 100 });
        helper.setState(widget.getConfiguration());
        widget.init({ helper, instantSearchInstance });
        widget.render({ results, helper });

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
        expect(ReactDOM.render.mock.calls[0][0].props.min).toEqual(1);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      });
    });

    describe('with results', () => {
      let results;

      beforeEach(() => {
        widget = rangeSlider({ container, attribute });
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
        expect(widget.getConfiguration()).toEqual({
          disjunctiveFacets: [attribute],
        });
      });

      it('calls twice ReactDOM.render', () => {
        widget.render({ results, helper });
        widget.render({ results, helper });

        expect(ReactDOM.render).toHaveBeenCalledTimes(2);
        expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
        expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
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
        });

        widget.init({ helper, instantSearchInstance });

        helper.addNumericRefinement(attribute, '>=', 5550);
        helper.addNumericRefinement(attribute, '<=', 6000);

        widget.render({ results, helper });

        expect(ReactDOM.render.mock.calls[0][0].props.values[0]).toBe(5000);
      });

      it("expect to clamp the max value to the min range when it's lower than range", () => {
        widget = rangeSlider({
          container,
          attribute,
        });

        widget.init({ helper, instantSearchInstance });

        helper.addNumericRefinement(attribute, '>=', -50);
        helper.addNumericRefinement(attribute, '<=', 0);

        widget.render({ results, helper });

        expect(ReactDOM.render.mock.calls[0][0].props.values[1]).toBe(1);
      });
    });
  });
});
