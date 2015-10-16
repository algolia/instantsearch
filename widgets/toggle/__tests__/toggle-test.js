/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import toggle from '../toggle';
import RefinementList from '../../../components/RefinementList';

describe('toggle()', () => {
  jsdom();

  var ReactDOM;
  var container;
  var widget;
  var results;
  var templateProps;
  var helper;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    toggle.__Rewire__('ReactDOM', ReactDOM);

    container = document.createElement('div');
    templateProps = {
      templatesConfig: undefined,
      templates: require('../defaultTemplates'),
      useCustomCompileOptions: {header: false, input: false, footer: false}
    };
    widget = toggle({container, facetName: 'aFacetName', label: 'A label'});
    results = {
      hits: [],
      getFacetValues: sinon.stub().returns([{name: 'true', count: 2}, {name: 'false', count: 1}])
    };
    helper = {
      hasRefinements: sinon.stub().returns(false),
      addFacetRefinement: sinon.spy(),
      removeFacetRefinement: sinon.spy()
    };
  });

  it('configures hitsPerPage', () => {
    expect(widget.getConfiguration()).toEqual({facets: ['aFacetName']});
  });

  it('calls ReactDOM.render(<Toggle props />, container)', () => {
    widget.render({results, helper});

    var props = {
      cssClasses: {item: null, list: null},
      label: 'A label',
      templateProps,
      toggleRefinement: sinon.spy()
    };
    props.transformData = ReactDOM.render.firstCall.args[0].props.transformData;
    props.toggleRefinement = ReactDOM.render.firstCall.args[0].props.toggleRefinement;

    expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
    expect(ReactDOM.render.firstCall.args[0]).toEqual(<RefinementList {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
  });

  afterEach(() => {
    toggle.__ResetDependency__('ReactDOM');
  });
});
