import expect from 'expect';
import sinon from 'sinon';
import clearRefinements from '../clear-refinements';

describe('clearRefinements()', () => {
  let ReactDOM;
  let container;
  let widget;
  let results;
  let helper;
  let createURL;

  beforeEach(() => {
    ReactDOM = { render: sinon.spy() };
    createURL = sinon.stub().returns('#all-cleared');

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
        clearRefinements: sinon.stub().returnsThis(),
        clearTags: sinon.stub().returnsThis(),
      },
      search: sinon.spy(),
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

      expect(ReactDOM.render.calledTwice).toBe(
        true,
        'ReactDOM.render called twice'
      );
      expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
      expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
      expect(ReactDOM.render.secondCall.args[0]).toMatchSnapshot();
      expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
    });
  });

  describe('with refinements', () => {
    beforeEach(() => {
      helper.state.facetsRefinements = ['something'];
    });

    it('calls twice ReactDOM.render(<ClearAll props />, container)', () => {
      widget.render({ results, helper, state: helper.state, createURL });
      widget.render({ results, helper, state: helper.state, createURL });

      expect(ReactDOM.render.calledTwice).toBe(
        true,
        'ReactDOM.render called twice'
      );
      expect(ReactDOM.render.firstCall.args[0]).toMatchSnapshot();
      expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
      expect(ReactDOM.render.secondCall.args[0]).toMatchSnapshot();
      expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
    });
  });

  afterEach(() => {
    clearRefinements.__ResetDependency__('render');
    clearRefinements.__ResetDependency__('defaultTemplates');
  });
});
