/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import priceRanges from '../price-ranges';
import generateRanges from '../generate-ranges';
import PriceRanges from '../../../components/PriceRanges/PriceRanges';

describe('priceRanges()', () => {
  var ReactDOM;
  var container;
  var widget;
  var results;
  var helper;
  var autoHideContainer;
  var headerFooter;

  jsdom({useEach: true});

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    autoHideContainer = sinon.stub().returns(PriceRanges);
    headerFooter = sinon.stub().returns(PriceRanges);

    priceRanges.__Rewire__('ReactDOM', ReactDOM);
    priceRanges.__Rewire__('autoHideContainer', autoHideContainer);
    priceRanges.__Rewire__('headerFooter', headerFooter);

    container = document.createElement('div');
    widget = priceRanges({container, facetName: 'aFacetname'});
    results = {
      hits: [1],
      nbHits: 1,
      getFacetStats: sinon.stub().returns({
        min: 1.99,
        max: 4999.98,
        avg: 243.349,
        sum: 2433490.0
      })
    };
  });

  it('adds the attribute as a facet', () => {
    expect(widget.getConfiguration()).toEqual({facets: ['aFacetname']});
  });

  context('without refinements', function() {
    var props;

    beforeEach(() => {
      helper = {
        getRefinements: sinon.stub().returns([]),
        clearRefinements: sinon.spy(),
        addNumericRefinement: sinon.spy(),
        search: sinon.spy()
      };

      props = {
        createURL: sinon.spy(),
        cssClasses: {
          active: 'ais-price-ranges--item__active',
          body: 'ais-price-ranges--body',
          button: 'ais-price-ranges--button',
          currency: 'ais-price-ranges--currency',
          footer: 'ais-price-ranges--footer',
          form: 'ais-price-ranges--form',
          header: 'ais-price-ranges--header',
          input: 'ais-price-ranges--input',
          item: 'ais-price-ranges--item',
          label: 'ais-price-ranges--label',
          list: 'ais-price-ranges--list',
          link: 'ais-price-ranges--link',
          root: 'ais-price-ranges',
          separator: 'ais-price-ranges--separator'
        },
        shouldAutoHideContainer: false,
        facetValues: generateRanges(results.getFacetStats()),
        labels: {
          currency: '$',
          separator: 'to',
          button: 'Go'
        },
        refine() {},
        templateProps: {
          templates: require('../defaultTemplates'),
          templatesConfig: undefined,
          transformData: undefined,
          useCustomCompileOptions: {header: false, footer: false, item: false}
        }
      };
    });

    it('calls ReactDOM.render(<PriceRanges props />, container)', () => {
      widget.render({results, helper});

      expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<PriceRanges {...props} />);
      expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    });

    it('calls the decorators', () => {
      widget.render({results, helper});
      expect(headerFooter.calledOnce).toBe(true);
      expect(autoHideContainer.calledOnce).toBe(true);
    });

    it('calls getRefinements to check if there are some refinements', () => {
      widget.render({results, helper});
      expect(helper.getRefinements.calledOnce).toBe(true, 'getRefinements called once');
    });

    it('refines on the lower bound', () => {
      widget._refine(helper, 10, undefined);
      expect(helper.clearRefinements.calledOnce).toBe(true, 'helper.clearRefinements called once');
      expect(helper.addNumericRefinement.calledOnce).toBe(true, 'helper.addNumericRefinement called once');
      expect(helper.search.calledOnce).toBe(true, 'helper.search called once');
    });

    it('refines on the upper bound', () => {
      widget._refine(helper, undefined, 10);
      expect(helper.clearRefinements.calledOnce).toBe(true, 'helper.clearRefinements called once');
      expect(helper.search.calledOnce).toBe(true, 'helper.search called once');
    });

    it('refines on the 2 bounds', () => {
      widget._refine(helper, 10, 20);
      expect(helper.clearRefinements.calledOnce).toBe(true, 'helper.clearRefinements called once');
      expect(helper.addNumericRefinement.calledTwice).toBe(true, 'helper.addNumericRefinement called twice');
      expect(helper.search.calledOnce).toBe(true, 'helper.search called once');
    });
  });

  afterEach(() => {
    priceRanges.__ResetDependency__('ReactDOM');
    priceRanges.__ResetDependency__('autoHideContainer');
    priceRanges.__ResetDependency__('headerFooter');
  });
});
