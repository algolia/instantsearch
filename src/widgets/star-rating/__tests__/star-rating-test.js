import React from 'react';
import sinon from 'sinon';
import expect from 'expect';

import jsHelper from 'algoliasearch-helper';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import defaultTemplates from '../../../widgets/star-rating/defaultTemplates.js';
import defaultLabels from '../../../widgets/star-rating/defaultLabels.js';
import starRating from '../star-rating.js';
import RefinementList from '../../../components/RefinementList/RefinementList.js';

const fakeClient = { addAlgoliaAgent: () => {} };
const SearchResults = jsHelper.SearchResults;

describe('starRating()', () => {
  let ReactDOM;
  let container;
  let widget;
  let helper;
  let state;
  let createURL;

  let results;

  beforeEach(() => {
    ReactDOM = { render: sinon.spy() };
    starRating.__Rewire__('ReactDOM', ReactDOM);

    container = document.createElement('div');
    widget = starRating({
      container,
      attributeName: 'anAttrName',
      cssClasses: { body: ['body', 'cx'] },
    });
    helper = {
      clearRefinements: sinon.spy(),
      addDisjunctiveFacetRefinement: sinon.spy(),
      getRefinements: sinon.stub().returns([]),
      search: sinon.spy(),
      setState: sinon.spy(),
    };
    state = {
      toggleRefinement: sinon.spy(),
    };
    results = {
      getFacetValues: sinon.stub().returns([]),
      hits: [],
    };
    createURL = () => '#';
    widget.init({
      helper,
      instantSearchInstance: { templatesConfig: undefined },
    });
  });

  it('configures the underlying disjunctive facet', () => {
    expect(widget.getConfiguration()).toEqual({
      disjunctiveFacets: ['anAttrName'],
    });
  });

  it('calls twice ReactDOM.render(<RefinementList props />, container)', () => {
    widget.render({ state, helper, results, createURL });
    widget.render({ state, helper, results, createURL });

    const props = {
      cssClasses: {
        active: 'ais-star-rating--item__active',
        body: 'ais-star-rating--body body cx',
        footer: 'ais-star-rating--footer',
        header: 'ais-star-rating--header',
        item: 'ais-star-rating--item',
        count: 'ais-star-rating--count',
        link: 'ais-star-rating--link',
        disabledLink: 'ais-star-rating--link__disabled',
        list: 'ais-star-rating--list',
        star: 'ais-star-rating--star',
        emptyStar: 'ais-star-rating--star__empty',
        root: 'ais-star-rating',
      },
      collapsible: false,
      createURL: () => {},
      facetValues: [
        {
          isRefined: false,
          stars: [true, true, true, true, false],
          count: 0,
          name: '4',
          value: '4',
          labels: defaultLabels,
        },
        {
          isRefined: false,
          stars: [true, true, true, false, false],
          count: 0,
          name: '3',
          value: '3',
          labels: defaultLabels,
        },
        {
          isRefined: false,
          stars: [true, true, false, false, false],
          count: 0,
          name: '2',
          value: '2',
          labels: defaultLabels,
        },
        {
          isRefined: false,
          stars: [true, false, false, false, false],
          count: 0,
          name: '1',
          value: '1',
          labels: defaultLabels,
        },
      ],
      toggleRefinement: () => {},
      shouldAutoHideContainer: false,
      templateProps: {
        templates: defaultTemplates,
        templatesConfig: undefined,
        transformData: undefined,
        useCustomCompileOptions: {
          footer: false,
          header: false,
          item: false,
        },
      },
    };

    expect(ReactDOM.render.callCount).toBe(2);
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
      <RefinementList {...props} />
    );
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(
      <RefinementList {...props} />
    );
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('hide the count==0 when there is a refinement', () => {
    helper.getRefinements = sinon.stub().returns([{ value: '1' }]);
    results.getFacetValues = sinon.stub().returns([{ name: '1', count: 42 }]);
    widget.render({ state, helper, results, createURL });
    expect(ReactDOM.render.callCount).toBe(1);
    expect(ReactDOM.render.firstCall.args[0].props.facetValues).toEqual([
      {
        count: 42,
        isRefined: true,
        name: '1',
        value: '1',
        stars: [true, false, false, false, false],
        labels: defaultLabels,
      },
    ]);
  });

  it("doesn't call the refinement functions if not refined", () => {
    helper.getRefinements = sinon.stub().returns([]);
    widget.render({ state, helper, results, createURL });
    expect(helper.clearRefinements.called).toBe(
      false,
      'clearRefinements never called'
    );
    expect(helper.addDisjunctiveFacetRefinement.called).toBe(
      false,
      'addDisjunctiveFacetRefinement never called'
    );
    expect(helper.search.called).toBe(false, 'search never called');
  });

  it('refines the search', () => {
    helper.getRefinements = sinon.stub().returns([]);
    widget._toggleRefinement('3');
    expect(helper.clearRefinements.calledOnce).toBe(
      true,
      'clearRefinements called once'
    );
    expect(helper.addDisjunctiveFacetRefinement.calledThrice).toBe(
      true,
      'addDisjunctiveFacetRefinement called thrice'
    );
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('toggles the refinements', () => {
    helper.getRefinements = sinon.stub().returns([{ value: '2' }]);
    widget._toggleRefinement('2');
    expect(helper.clearRefinements.calledOnce).toBe(
      true,
      'clearRefinements called once'
    );
    expect(helper.addDisjunctiveFacetRefinement.called).toBe(
      false,
      'addDisjunctiveFacetRefinement never called'
    );
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('toggles the refinements with another facet', () => {
    helper.getRefinements = sinon.stub().returns([{ value: '2' }]);
    widget._toggleRefinement('4');
    expect(helper.clearRefinements.calledOnce).toBe(
      true,
      'clearRefinements called once'
    );
    expect(helper.addDisjunctiveFacetRefinement.calledTwice).toBe(
      true,
      'addDisjunctiveFacetRefinement called twice'
    );
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('should return the right facet counts and results', () => {
    const attributeName = 'anAttrName';

    const _widget = starRating({
      container,
      attributeName,
      cssClasses: { body: ['body', 'cx'] },
    });
    const _helper = jsHelper(fakeClient, '', _widget.getConfiguration({}));
    _helper.search = sinon.stub();

    _widget.init({
      helper: _helper,
      state: _helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
      instantSearchInstance: {
        templatesConfig: {},
      },
    });

    _widget.render({
      results: new SearchResults(_helper.state, [
        {
          facets: {
            [attributeName]: { 0: 5, 1: 10, 2: 20, 3: 50, 4: 900, 5: 100 },
          },
        },
        {},
      ]),
      state: _helper.state,
      helper: _helper,
      createURL: () => '#',
      instantSearchInstance: {
        templatesConfig: {},
      },
    });

    expect(ReactDOM.render.lastCall.args[0].props.facetValues).toEqual([
      {
        count: 1000,
        isRefined: false,
        labels: { andUp: '& Up' },
        name: '4',
        value: '4',
        stars: [true, true, true, true, false],
      },
      {
        count: 1050,
        isRefined: false,
        labels: { andUp: '& Up' },
        name: '3',
        value: '3',
        stars: [true, true, true, false, false],
      },
      {
        count: 1070,
        isRefined: false,
        labels: { andUp: '& Up' },
        name: '2',
        value: '2',
        stars: [true, true, false, false, false],
      },
      {
        count: 1080,
        isRefined: false,
        labels: { andUp: '& Up' },
        name: '1',
        value: '1',
        stars: [true, false, false, false, false],
      },
    ]);
  });

  afterEach(() => {
    starRating.__ResetDependency__('ReactDOM');
    starRating.__ResetDependency__('autoHideContainerHOC');
    starRating.__ResetDependency__('headerFooterHOC');
  });
});
