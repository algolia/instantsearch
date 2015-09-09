/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';

import priceRanges from '../price-ranges';
import generateRanges from '../generate-ranges';
import PriceRanges from '../../../components/PriceRanges';

describe('priceRanges()', () => {
  var ReactDOM;
  var container;
  var widget;
  var results;
  var helper;

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    priceRanges.__Rewire__('ReactDOM', ReactDOM);

    container = document.createElement('div');
    widget = priceRanges({container, facetName: 'aFacetname'});
    results = {
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
        cssClasses: {},
        facetValues: generateRanges(results.getFacetStats()),
        labels: {
          currency: '$',
          to: 'to',
          button: 'Go'
        },
        templateProps: {
          templates: require('../defaultTemplates'),
          templatesConfig: undefined,
          transformData: undefined,
          useCustomCompileOptions: {range: false}
        }
      };
    });

    it('calls ReactDOM.render(<PriceRanges props />, container)', () => {
      widget.render({results, helper});
      props.refine = ReactDOM.render.firstCall.args[0].props.refine;

      expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
      expect(ReactDOM.render.firstCall.args).toEqual([
        <PriceRanges {...props} />,
        container
      ]);
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
  });
});
