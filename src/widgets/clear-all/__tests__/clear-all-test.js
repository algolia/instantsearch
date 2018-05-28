import expect from 'expect';
import sinon from 'sinon';
import clearAll from '../clear-all';
import defaultTemplates from '../defaultTemplates.js';

describe('clearAll()', () => {
  let ReactDOM;
  let container;
  let widget;
  let props;
  let results;
  let helper;
  let createURL;

  beforeEach(() => {
    ReactDOM = { render: sinon.spy() };
    createURL = sinon.stub().returns('#all-cleared');

    clearAll.__Rewire__('render', ReactDOM.render);

    container = document.createElement('div');
    widget = clearAll({
      container,
      autoHideContainer: true,
      cssClasses: { root: ['root', 'cx'] },
    });

    results = {};
    helper = {
      state: {
        clearRefinements: sinon.stub().returnsThis(),
        clearTags: sinon.stub().returnsThis(),
      },
      search: sinon.spy(),
    };

    props = {
      refine: sinon.spy(),
      cssClasses: {
        root: 'ais-clear-all root cx',
        header: 'ais-clear-all--header',
        body: 'ais-clear-all--body',
        footer: 'ais-clear-all--footer',
        link: 'ais-clear-all--link',
      },
      collapsible: false,
      hasRefinements: false,
      shouldAutoHideContainer: true,
      templateProps: {
        templates: defaultTemplates,
        templatesConfig: {},
        transformData: undefined,
        useCustomCompileOptions: { header: false, footer: false, link: false },
      },
      url: '#all-cleared',
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
      props.hasRefinements = false;
      props.shouldAutoHideContainer = true;
    });

    it('calls twice ReactDOM.render(<ClearAll props />, container)', () => {
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
      props.hasRefinements = true;
      props.shouldAutoHideContainer = false;
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
    clearAll.__ResetDependency__('render');
    clearAll.__ResetDependency__('defaultTemplates');
  });
});
