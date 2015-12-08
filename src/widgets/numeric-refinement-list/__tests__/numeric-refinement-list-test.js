/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('numericRefinementList call', () => {
  jsdom({useEach: true});
  const numericRefinementList = require('../numeric-refinement-list.js');

  it('throws an exception when no container', () => {
    const attributeName = '';
    const options = [];
    expect(numericRefinementList.bind(null, {attributeName, options})).toThrow(/^Usage/);
  });

  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    const options = [];
    expect(numericRefinementList.bind(null, {container, options})).toThrow(/^Usage/);
  });

  it('throws an exception when no options', () => {
    const container = document.createElement('div');
    const attributeName = '';
    expect(numericRefinementList.bind(null, {attributeName, container})).toThrow(/^Usage/);
  });
});

describe('numericRefinementList()', () => {
  jsdom({useEach: true});

  let ReactDOM;
  let container;
  let widget;
  let helper;

  let autoHideContainer;
  let headerFooter;
  let RefinementList;
  let numericRefinementList;
  let options;
  let results;

  beforeEach(() => {
    numericRefinementList = require('../numeric-refinement-list.js');
    RefinementList = require('../../../components/RefinementList/RefinementList.js');
    ReactDOM = {render: sinon.spy()};
    numericRefinementList.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = sinon.stub().returns(RefinementList);
    numericRefinementList.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = sinon.stub().returns(RefinementList);
    numericRefinementList.__Rewire__('headerFooterHOC', headerFooter);

    options = [
      {name: 'All'},
      {end: 4, name: 'less than 4'},
      {start: 4, end: 4, name: '4'},
      {start: 5, end: 10, name: 'between 5 and 10'},
      {start: 10, name: 'more than 10'}
    ];

    container = document.createElement('div');
    widget = numericRefinementList({container, attributeName: 'price', options: options});
    helper = {
      state: {
        getNumericRefinements: sinon.stub().returns([])
      },
      addNumericRefinement: sinon.spy(),
      search: sinon.spy(),
      setState: sinon.spy()
    };
    results = {
      hits: []
    };

    helper.state.clearRefinements = sinon.stub().returns(helper.state);
    helper.state.addNumericRefinement = sinon.stub().returns(helper.state);
  });

  it('calls twice ReactDOM.render(<RefinementList props />, container)', () => {
    widget.render({helper, results});
    widget.render({helper, results});

    let props = {
      cssClasses: {
        active: 'ais-refinement-list--item__active',
        body: 'ais-refinement-list--body',
        footer: 'ais-refinement-list--footer',
        header: 'ais-refinement-list--header',
        item: 'ais-refinement-list--item',
        label: 'ais-refinement-list--label',
        list: 'ais-refinement-list--list',
        radio: 'ais-refinement-list--radio',
        root: 'ais-refinement-list'
      },
      facetValues: [
        {attributeName: 'price', isRefined: true, name: 'All'},
        {attributeName: 'price', end: 4, isRefined: false, name: 'less than 4'},
        {attributeName: 'price', end: 4, isRefined: false, name: '4', start: 4},
        {attributeName: 'price', end: 10, isRefined: false, name: 'between 5 and 10', start: 5},
        {attributeName: 'price', isRefined: false, name: 'more than 10', start: 10}
      ],
      createURL: () => {},
      toggleRefinement: () => {},
      shouldAutoHideContainer: false,
      templateProps: {
        templates: {footer: '', header: '', item: '<label class="{{cssClasses.label}}">\n <input type="radio" class="{{cssClasses.checkbox}}" name="{{attributeName}}" {{#isRefined}}checked{{/isRefined}} />{{name}}\n</label>'},
        templatesConfig: undefined,
        transformData: undefined,
        useCustomCompileOptions: {
          footer: false,
          header: false,
          item: false
        }
      }
    };

    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
    expect(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<RefinementList {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<RefinementList {...props} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('doesn\'t call the refinement functions if not refined', () => {
    widget.render({helper, results});
    expect(helper.state.clearRefinements.called).toBe(false, 'clearRefinements called one');
    expect(helper.state.addNumericRefinement.called).toBe(false, 'addNumericRefinement never called');
    expect(helper.search.called).toBe(false, 'search never called');
  });

  it('calls the refinement functions if refined with "4"', () => {
    widget._toggleRefinement(helper, '4');
    expect(helper.state.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.state.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    expect(helper.state.addNumericRefinement.getCall(0).args).toEqual(['price', '=', 4]);
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('calls the refinement functions if refined with "between 5 and 10"', () => {
    widget._toggleRefinement(helper, 'between 5 and 10');
    expect(helper.state.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.state.addNumericRefinement.calledTwice).toBe(true, 'addNumericRefinement called twice');
    expect(helper.state.addNumericRefinement.getCall(0).args).toEqual(['price', '>=', 5]);
    expect(helper.state.addNumericRefinement.getCall(1).args).toEqual(['price', '<=', 10]);
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('calls two times the refinement functions if refined with "less than 4"', () => {
    widget._toggleRefinement(helper, 'less than 4');
    expect(helper.state.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.state.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    expect(helper.state.addNumericRefinement.getCall(0).args).toEqual(['price', '<=', 4]);
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('calls two times the refinement functions if refined with "more than 10"', () => {
    widget._toggleRefinement(helper, 'more than 10');
    expect(helper.state.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    expect(helper.state.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    expect(helper.state.addNumericRefinement.getCall(0).args).toEqual(['price', '>=', 10]);
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  afterEach(() => {
    numericRefinementList.__ResetDependency__('ReactDOM');
    numericRefinementList.__ResetDependency__('autoHideContainerHOC');
    numericRefinementList.__ResetDependency__('headerFooterHOC');
  });
});
