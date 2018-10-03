import expect from 'expect';
import clearRefinements from '../clear-refinements';

describe('clearRefinements()', () => {
  let ReactDOM;
  let container;
  let widget;
  let results;
  let helper;
  let createURL;

  beforeEach(() => {
    ReactDOM = { render: jest.fn() };
    createURL = jest.fn().mockReturnValue('#all-cleared');

    clearRefinements.__Rewire__('render', ReactDOM.render);

    container = document.createElement('div');
    widget = clearRefinements({
      container,
      cssClasses: {
        root: ['myRoot'],
        button: ['myButton'],
        disabledButton: ['disabled'],
      },
    });

    results = {};
    helper = {
      state: {
        clearRefinements: jest.fn().mockReturnValue(this),
        clearTags: jest.fn().mockReturnValue(this),
      },
      search: jest.fn(),
    };

    widget.init({
      helper,
      createURL,
      instantSearchInstance: {
        templatesConfig: {},
      },
    });
  });

  it('configures nothing', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  describe('without refinements', () => {
    beforeEach(() => {
      helper.state.facetsRefinements = {};
    });

    it('calls twice ReactDOM.render(<ClearRefinements props />, container)', () => {
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
      widget.render({ results, helper, state: helper.state, createURL });
      widget.render({ results, helper, state: helper.state, createURL });

      expect(ReactDOM.render).toHaveBeenCalledTimes(2);
      expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
      expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);
      expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
      expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
    });
  });

  afterEach(() => {
    clearRefinements.__ResetDependency__('render');
  });
});
