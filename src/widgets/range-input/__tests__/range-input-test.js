import ReactDOM from 'preact-compat';
import AlgoliasearchHelper from 'algoliasearch-helper';
import rangeInput from '../range-input';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

describe('rangeInput', () => {
  const attributeName = 'aNumAttr';
  const createContainer = () => document.createElement('div');
  const instantSearchInstance = { templatesConfig: undefined };
  const createHelper = () =>
    new AlgoliasearchHelper(
      {
        search() {
          return Promise.resolve({ results: [{}] });
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

  it('expect to render with min', () => {
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

  it('expect to render with max', () => {
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

  it('expect to render with refinement at boundaries', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = {};

    helper.addNumericRefinement(attributeName, '>=', 10);
    helper.addNumericRefinement(attributeName, '<=', 500);

    const widget = rangeInput({
      container,
      attributeName,
      min: 10,
      max: 500,
    });

    widget.init({ helper, instantSearchInstance });
    widget.render({ results, helper });

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][0].props.values).toEqual({
      min: undefined,
      max: undefined,
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

    // Override _refine behavior to be able to check
    // if refine is correctly passed to the component
    widget._refine = () => refine;

    widget.init({ helper, instantSearchInstance });
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
});
