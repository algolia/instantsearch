import ReactDOM from 'react-dom';
import AlgoliasearchHelper from 'algoliasearch-helper';
import rangeInput from '../range-input.js';

jest.mock('react-dom', () => ({
  render: jest.fn(),
}));

describe('rangeInput', () => {
  const attributeName = 'aNumAttr';
  const createContainer = () => document.createElement('div');
  const instantSearchInstance = { templatesConfig: undefined };
  const createHelper = () =>
    new AlgoliasearchHelper(
      {
        search() {},
        addAlgoliaAgent() {
          return {};
        },
      },
      'indexName',
      { disjunctiveFacets: [attributeName] }
    );

  afterEach(() => {
    ReactDOM.render.mockReset();
  });

  it('expect to render with results', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = {
      disjunctiveFacets: [
        {
          name: attributeName,
          stats: {
            min: 10,
            max: 500,
          },
        },
      ],
    };

    const widget = rangeInput({
      container,
      attributeName,
    });

    widget.init({ helper, instantSearchInstance });
    widget.render({ results, helper });

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0].props.min).toBe(10);
    expect(ReactDOM.render.mock.calls[0][0].props.max).toBe(500);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('expect to render without results', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = [];

    const widget = rangeInput({
      container,
      attributeName,
    });

    widget.init({ helper, instantSearchInstance });
    widget.render({ results, helper });

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('expect to render with custom classNames', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = [];

    const widget = rangeInput({
      container,
      attributeName,
      cssClasses: {
        root: 'custom-root',
        header: 'custom-header',
        body: 'custom-body',
        form: 'custom-form',
        fieldset: 'custom-fieldset',
        labelMin: 'custom-labelMin',
        inputMin: 'custom-inputMin',
        separator: 'custom-separator',
        labelMax: 'custom-labelMax',
        inputMax: 'custom-inputMax',
        submit: 'custom-submit',
        footer: 'custom-footer',
      },
    });

    widget.init({ helper, instantSearchInstance });
    widget.render({ results, helper });

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('expect to render with custom labels', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = [];

    const widget = rangeInput({
      container,
      attributeName,
      labels: {
        separator: 'custom-separator',
        submit: 'custom-submit',
      },
    });

    widget.init({ helper, instantSearchInstance });
    widget.render({ results, helper });

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('exepct to render with min', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = [];

    const widget = rangeInput({
      container,
      attributeName,
      min: 20,
    });

    widget.init({ helper, instantSearchInstance });
    widget.render({ results, helper });

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0].props.min).toBe(20);
  });

  it('exepct to render with max', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = [];

    const widget = rangeInput({
      container,
      attributeName,
      max: 480,
    });

    widget.init({ helper, instantSearchInstance });
    widget.render({ results, helper });

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0].props.max).toBe(480);
  });

  it('expect to render with refinement', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = {
      disjunctiveFacets: [
        {
          name: attributeName,
          stats: {
            min: 10,
            max: 500,
          },
        },
      ],
    };

    helper.addNumericRefinement(attributeName, '>=', 25);
    helper.addNumericRefinement(attributeName, '<=', 475);

    const widget = rangeInput({
      container,
      attributeName,
    });

    widget.init({ helper, instantSearchInstance });
    widget.render({ results, helper });

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][0].props.values).toEqual({
      min: 25,
      max: 475,
    });
  });

  it('expect to render hidden', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = [];

    const widget = rangeInput({
      container,
      attributeName,
      min: 20,
      max: 20,
    });

    widget.init({ helper, instantSearchInstance });
    widget.render({ results, helper });

    expect(ReactDOM.render.mock.calls[0][0].props.shouldAutoHideContainer).toBe(
      true
    );
  });

  it('expect to call refine', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = [];
    const refine = jest.fn();

    const widget = rangeInput({
      container,
      attributeName,
    });

    widget.init({ helper, instantSearchInstance });

    // Override _refine behavior to be able to check
    // if refine is correctly passed to the component
    // Must be applied after init for now, because the
    // refine function is bound to the instance in init
    widget._refine = () => refine;

    widget.render({ results, helper });

    ReactDOM.render.mock.calls[0][0].props.refine([25, 475]);

    expect(refine).toHaveBeenCalledWith([25, 475]);
  });

  describe('precision', () => {
    it('expect to render with default precision', () => {
      const container = createContainer();
      const helper = createHelper();
      const results = [];

      const widget = rangeInput({
        container,
        attributeName,
        precision: 2,
      });

      widget.init({ helper, instantSearchInstance });
      widget.render({ results, helper });

      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
      expect(ReactDOM.render.mock.calls[0][0].props.step).toBe(0.01);
    });

    it('expect to render with precision of 0', () => {
      const container = createContainer();
      const helper = createHelper();
      const results = [];

      const widget = rangeInput({
        container,
        attributeName,
        precision: 0,
      });

      widget.init({ helper, instantSearchInstance });
      widget.render({ results, helper });

      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
      expect(ReactDOM.render.mock.calls[0][0].props.step).toBe(1);
    });

    it('expect to render with precision of 1', () => {
      const container = createContainer();
      const helper = createHelper();
      const results = [];

      const widget = rangeInput({
        container,
        attributeName,
        precision: 1,
      });

      widget.init({ helper, instantSearchInstance });
      widget.render({ results, helper });

      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
      expect(ReactDOM.render.mock.calls[0][0].props.step).toBe(0.1);
    });
  });

  describe('throws', () => {
    it('throws an exception when no container', () => {
      expect(() => rangeInput({ attributeName: '' })).toThrow(/^Usage:/);
    });

    it('throws an exception when no attributeName', () => {
      expect(() =>
        rangeInput({
          container: document.createElement('div'),
        })
      ).toThrow(/^Usage:/);
    });
  });

  // it('should `shouldAutoHideContainer` when range min === max', () => {
  //   const results = {
  //     disjunctiveFacets: [
  //       {
  //         name: attributeName,
  //         stats: {
  //           min: 65,
  //           max: 65,
  //         },
  //       },
  //     ],
  //   };
  //
  //   widget = rangeInput({
  //     container,
  //     attributeName,
  //     cssClasses: { root: ['root', 'cx'] },
  //   });
  //
  //   widget.init({ helper, instantSearchInstance });
  //   widget.render({ results, helper });
  //
  //   expect(ReactDOM.render).toHaveBeenCalledTimes(1);
  //   expect(
  //     ReactDOM.render.mock.calls[0][0].props.shouldAutoHideContainer
  //   ).toEqual(true);
  //   expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  // });

  //   describe('min option', () => {
  //     it('refines when no previous configuration', () => {
  //       widget = rangeInput({ container, attributeName, min: 100 });
  //       expect(widget.getConfiguration()).toEqual({
  //         disjunctiveFacets: [attributeName],
  //         numericRefinements: { [attributeName]: { '>=': [100] } },
  //       });
  //     });
  //
  //     it('does not refine when previous configuration', () => {
  //       widget = rangeInput({
  //         container,
  //         attributeName: 'aNumAttr',
  //         min: 100,
  //       });
  //       expect(
  //         widget.getConfiguration({
  //           numericRefinements: { [attributeName]: {} },
  //         })
  //       ).toEqual({
  //         disjunctiveFacets: [attributeName],
  //       });
  //     });
  //
  //     it('works along with max option', () => {
  //       widget = rangeInput({ container, attributeName, min: 100, max: 200 });
  //       expect(widget.getConfiguration()).toEqual({
  //         disjunctiveFacets: [attributeName],
  //         numericRefinements: {
  //           [attributeName]: {
  //             '>=': [100],
  //             '<=': [200],
  //           },
  //         },
  //       });
  //     });
  //
  //     it('sets the right range', () => {
  //       widget = rangeInput({ container, attributeName, min: 100, max: 200 });
  //       helper.setState(widget.getConfiguration());
  //       widget.init({ helper, instantSearchInstance });
  //       widget.render({ results: {}, helper });
  //
  //       expect(ReactDOM.render).toHaveBeenCalledTimes(1);
  //       expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  //     });
  //
  //     it('will use the results max when only min passed', () => {
  //       const results = {
  //         disjunctiveFacets: [
  //           {
  //             name: attributeName,
  //             stats: {
  //               min: 1.99,
  //               max: 4999.98,
  //             },
  //           },
  //         ],
  //       };
  //
  //       widget = rangeInput({ container, attributeName, min: 100 });
  //       helper.setState(widget.getConfiguration());
  //       widget.init({ helper, instantSearchInstance });
  //       widget.render({ results, helper });
  //
  //       expect(ReactDOM.render).toHaveBeenCalledTimes(1);
  //       expect(ReactDOM.render.mock.calls[0][0].props.max).toEqual(5000);
  //       expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  //     });
  //   });
  //
  //   describe('max option', () => {
  //     it('refines when no previous configuration', () => {
  //       widget = rangeInput({ container, attributeName, max: 100 });
  //       expect(widget.getConfiguration()).toEqual({
  //         disjunctiveFacets: [attributeName],
  //         numericRefinements: { [attributeName]: { '<=': [100] } },
  //       });
  //     });
  //
  //     it('does not refine when previous configuration', () => {
  //       widget = rangeInput({ container, attributeName, max: 100 });
  //       expect(
  //         widget.getConfiguration({
  //           numericRefinements: { [attributeName]: {} },
  //         })
  //       ).toEqual({
  //         disjunctiveFacets: [attributeName],
  //       });
  //     });
  //
  //     it('will use the results min when only max is passed', () => {
  //       const results = {
  //         disjunctiveFacets: [
  //           {
  //             name: attributeName,
  //             stats: {
  //               min: 1.99,
  //               max: 4999.98,
  //             },
  //           },
  //         ],
  //       };
  //
  //       widget = rangeInput({ container, attributeName, max: 100 });
  //       helper.setState(widget.getConfiguration());
  //       widget.init({ helper, instantSearchInstance });
  //       widget.render({ results, helper });
  //
  //       expect(ReactDOM.render).toHaveBeenCalledTimes(1);
  //       expect(ReactDOM.render.mock.calls[0][0].props.min).toEqual(1);
  //       expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  //     });
  //   });
  //
  //   describe('with results', () => {
  //     let results;
  //
  //     beforeEach(() => {
  //       widget = rangeInput({ container, attributeName });
  //       widget.init({ helper, instantSearchInstance });
  //
  //       results = {
  //         disjunctiveFacets: [
  //           {
  //             name: attributeName,
  //             stats: {
  //               min: 1.99,
  //               max: 4999.98,
  //             },
  //           },
  //         ],
  //       };
  //
  //       helper.search = jest.fn();
  //     });
  //
  //     it('configures the disjunctiveFacets', () => {
  //       expect(widget.getConfiguration()).toEqual({
  //         disjunctiveFacets: [attributeName],
  //       });
  //     });
  //
  //     it('calls twice ReactDOM.render', () => {
  //       widget.render({ results, helper });
  //       widget.render({ results, helper });
  //
  //       expect(ReactDOM.render).toHaveBeenCalledTimes(2);
  //       expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  //       expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
  //     });
  //
  //     it('does not call the refinement functions if not refined', () => {
  //       const state0 = helper.state;
  //       widget.render({ results, helper });
  //       const state1 = helper.state;
  //
  //       expect(state0).toEqual(state1);
  //       expect(helper.search).not.toHaveBeenCalled();
  //     });
  //
  //     it('calls the refinement function if refined with min+1', () => {
  //       const [{ stats }] = results.disjunctiveFacets;
  //       const targetValue = stats.min + 1;
  //
  //       const state0 = helper.state;
  //       widget._refine(stats)([targetValue, stats.max]);
  //       const state1 = helper.state;
  //
  //       expect(helper.search).toHaveBeenCalledTimes(1);
  //       expect(state1).toEqual(
  //         state0.addNumericRefinement(attributeName, '>=', targetValue)
  //       );
  //     });
  //
  //     it('calls the refinement function if refined with max-1', () => {
  //       const [{ stats }] = results.disjunctiveFacets;
  //       const targetValue = stats.max - 1;
  //
  //       const state0 = helper.state;
  //       widget._refine(stats)([stats.min, targetValue]);
  //       const state1 = helper.state;
  //
  //       expect(helper.search).toHaveBeenCalledTimes(1);
  //       expect(state1).toEqual(
  //         state0.addNumericRefinement(attributeName, '<=', targetValue)
  //       );
  //     });
  //
  //     it('calls the refinement function if refined with min+1 and max-1', () => {
  //       const [{ stats }] = results.disjunctiveFacets;
  //       const targetValue = [stats.min + 1, stats.max - 1];
  //
  //       const state0 = helper.state;
  //       widget._refine(stats)(targetValue);
  //       const state1 = helper.state;
  //
  //       expect(helper.search).toHaveBeenCalledTimes(1);
  //       expect(state1).toEqual(
  //         state0
  //           .addNumericRefinement(attributeName, '>=', targetValue[0])
  //           .addNumericRefinement(attributeName, '<=', targetValue[1])
  //       );
  //     });
  //   });
});
