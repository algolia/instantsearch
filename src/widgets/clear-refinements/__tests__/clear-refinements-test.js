import { render } from 'preact-compat';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import clearRefinements from '../clear-refinements';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

describe('clearRefinements()', () => {
  let container;
  let results;
  let client;
  let helper;
  let createURL;

  beforeEach(() => {
    createURL = jest.fn().mockReturnValue('#all-cleared');
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

    render.mockClear();
  });

  describe('without refinements', () => {
    beforeEach(() => {
      helper.state.facetsRefinements = {};
    });

    it('calls twice render(<ClearRefinements props />, container)', () => {
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

      expect(render).toHaveBeenCalledTimes(2);

      expect(render.mock.calls[0][0]).toMatchSnapshot();
      expect(render.mock.calls[0][1]).toEqual(container);

      expect(render.mock.calls[1][0]).toMatchSnapshot();
      expect(render.mock.calls[1][1]).toEqual(container);
    });
  });

  describe('with refinements', () => {
    beforeEach(() => {
      helper.state.facetsRefinements = ['something'];
    });

    it('calls twice render(<ClearAll props />, container)', () => {
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

      expect(render).toHaveBeenCalledTimes(2);

      expect(render.mock.calls[0][0]).toMatchSnapshot();
      expect(render.mock.calls[0][1]).toEqual(container);

      expect(render.mock.calls[1][0]).toMatchSnapshot();
      expect(render.mock.calls[1][1]).toEqual(container);
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
      expect(render.mock.calls[0][0].props.cssClasses).toMatchSnapshot();
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

      expect(render.mock.calls[0][0].props.cssClasses).toMatchSnapshot();
    });
  });
});
