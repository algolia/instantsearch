import clearRefinements from '../clear-refinements';
import algoliasearchHelper from 'algoliasearch-helper';
import algoliasearch from 'algoliasearch';

describe('clearRefinements()', () => {
  let ReactDOM;
  let container;
  let results;
  let client;
  let helper;
  let createURL;

  beforeEach(() => {
    ReactDOM = { render: jest.fn() };
    createURL = jest.fn().mockReturnValue('#all-cleared');

    clearRefinements.__Rewire__('render', ReactDOM.render);

    container = document.createElement('div');
    results = {};
    client = algoliasearch('APP_ID', 'API_KEY');
    helper = {
      state: {
        clearRefinements: jest.fn().mockReturnThis(),
        clearTags: jest.fn().mockReturnThis(),
      },
      search: jest.fn(),
    };
  });

  describe('without refinements', () => {
    beforeEach(() => {
      helper.state.facetsRefinements = {};
    });

    it('calls twice ReactDOM.render(<ClearRefinements props />, container)', () => {
      const widget = clearRefinements({
        container,
      });

      widget.init({
        helper,
        createURL,
        instantSearchInstance: {
          templatesConfig: {},
        },
      });
      widget.render({
        results,
        helper,
        state: helper.state,
        createURL,
        instantSearchInstance: {},
      });
      widget.render({
        results,
        helper,
        state: helper.state,
        createURL,
        instantSearchInstance: {},
      });

      expect(ReactDOM.render).toHaveBeenCalledTimes(2);

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);

      expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
      expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
    });
  });

  describe('with refinements', () => {
    beforeEach(() => {
      helper.state.facetsRefinements = ['something'];
    });

    it('calls twice ReactDOM.render(<ClearAll props />, container)', () => {
      const widget = clearRefinements({
        container,
      });
      widget.init({
        helper,
        createURL,
        instantSearchInstance: {
          templatesConfig: {},
        },
      });
      widget.render({ results, helper, state: helper.state, createURL });
      widget.render({ results, helper, state: helper.state, createURL });

      expect(ReactDOM.render).toHaveBeenCalledTimes(2);

      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);

      expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
      expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
    });
  });

  describe('cssClasses', () => {
    it('should add the default CSS classes', () => {
      helper = algoliasearchHelper(client, 'index_name');
      const widget = clearRefinements({
        container,
      });

      widget.init({
        helper,
        createURL,
        instantSearchInstance: {
          templatesConfig: {},
        },
      });

      widget.render({ results, helper, state: helper.state, createURL });
      expect(
        ReactDOM.render.mock.calls[0][0].props.cssClasses
      ).toMatchSnapshot();
    });

    it('should allow overriding CSS classes', () => {
      const widget = clearRefinements({
        container,
        cssClasses: {
          root: 'myRoot',
          button: ['myButton', 'myPrimaryButton'],
          disabledButton: ['disabled'],
        },
      });
      widget.init({
        helper,
        createURL,
        instantSearchInstance: {
          templatesConfig: {},
        },
      });
      widget.render({ results, helper, state: helper.state, createURL });

      expect(
        ReactDOM.render.mock.calls[0][0].props.cssClasses
      ).toMatchSnapshot();
    });
  });

  afterEach(() => {
    clearRefinements.__ResetDependency__('render');
  });
});
