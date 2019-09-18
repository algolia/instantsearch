import ReactDOM from 'preact-compat';
import AlgoliasearchHelper from 'algoliasearch-helper';
import rangeInput from '../range-input';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();
  module.unmountComponentAtNode = jest.fn();

  return module;
});

describe('rangeInput', () => {
  const attribute = 'aNumAttr';
  const createContainer = () => document.createElement('div');
  const instantSearchInstance = {};
  const createHelper = () =>
    new AlgoliasearchHelper(
      {
        search() {
          return Promise.resolve({ results: [{}] });
        },
      },
      'indexName',
      { disjunctiveFacets: [attribute] }
    );

  afterEach(() => {
    ReactDOM.render.mockReset();
    ReactDOM.unmountComponentAtNode.mockReset();
  });

  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => rangeInput({ container: undefined }))
        .toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/range-input/js/"
`);
    });
  });

  describe('Lifecycle', () => {
    describe('dispose', () => {
      it('unmounts the component', () => {
        const container = document.createElement('div');
        const helper = createHelper();
        const widget = rangeInput({
          attribute: 'price',
          container,
        });

        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledTimes(0);

        widget.dispose({
          state: helper.state,
          helper,
        });

        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledTimes(1);
        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(container);
      });
    });
  });

  it('expect to render with results', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = {
      disjunctiveFacets: [
        {
          name: attribute,
          stats: {
            min: 10,
            max: 500,
          },
        },
      ],
    };

    const widget = rangeInput({
      container,
      attribute,
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
      attribute,
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
      attribute,
      cssClasses: {
        root: 'root',
        noRefinement: 'noRefinement',
        form: 'form',
        label: 'label',
        input: 'input',
        inputMin: 'inputMin',
        inputMax: 'inputMax',
        separator: 'separator',
        submit: 'submit',
      },
    });

    widget.init({ helper, instantSearchInstance });
    widget.render({ results, helper });

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('expect to render with custom templates', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = [];

    const widget = rangeInput({
      container,
      attribute,
      templates: {
        separatorText: 'custom separator',
        submitText: 'custom submit',
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
      attribute,
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
      attribute,
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
          name: attribute,
          stats: {
            min: 10,
            max: 500,
          },
        },
      ],
    };

    helper.addNumericRefinement(attribute, '>=', 25);
    helper.addNumericRefinement(attribute, '<=', 475);

    const widget = rangeInput({
      container,
      attribute,
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

    helper.addNumericRefinement(attribute, '>=', 10);
    helper.addNumericRefinement(attribute, '<=', 500);

    const widget = rangeInput({
      container,
      attribute,
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

  it('expect to call refine', () => {
    const container = createContainer();
    const helper = createHelper();
    const results = [];
    const refine = jest.fn();

    const widget = rangeInput({
      container,
      attribute,
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
        attribute,
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
        attribute,
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
        attribute,
        precision: 1,
      });

      widget.init({ helper, instantSearchInstance });
      widget.render({ results, helper });

      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
      expect(ReactDOM.render.mock.calls[0][0].props.step).toBe(0.1);
    });
  });
});
