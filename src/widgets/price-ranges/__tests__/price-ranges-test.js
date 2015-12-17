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

describe('priceRanges call', () => {
  jsdom({useEach: true});

  it('throws an exception when no container', () => {
    const attributeName = '';
    expect(priceRanges.bind(null, {attributeName})).toThrow(/^Usage:/);
  });

  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(priceRanges.bind(null, {container})).toThrow(/^Usage:/);
  });
});

describe('priceRanges()', () => {
  let ReactDOM;
  let container;
  let widget;
  let results;
  let helper;
  let autoHideContainer;
  let headerFooter;

  jsdom({useEach: true});

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    autoHideContainer = sinon.stub().returns(PriceRanges);
    headerFooter = sinon.stub().returns(PriceRanges);

    priceRanges.__Rewire__('ReactDOM', ReactDOM);
    priceRanges.__Rewire__('autoHideContainerHOC', autoHideContainer);
    priceRanges.__Rewire__('headerFooterHOC', headerFooter);

    container = document.createElement('div');
    widget = priceRanges({container, attributeName: 'aNumAttr'});
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
    expect(widget.getConfiguration()).toEqual({facets: ['aNumAttr']});
  });

  context('without refinements', function() {
    let props;

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
          templates: require('../defaultTemplates.js'),
          templatesConfig: undefined,
          transformData: undefined,
          useCustomCompileOptions: {header: false, footer: false, item: false}
        }
      };
    });

    it('calls twice ReactDOM.render(<PriceRanges props />, container)', () => {
      widget.render({results, helper});
      widget.render({results, helper});

      expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<PriceRanges {...props} />);
      expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
      expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<PriceRanges {...props} />);
      expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
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
    priceRanges.__ResetDependency__('autoHideContainerHOC');
    priceRanges.__ResetDependency__('headerFooterHOC');
  });
});
