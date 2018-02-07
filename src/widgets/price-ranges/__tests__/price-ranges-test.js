import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import priceRanges from '../price-ranges.js';
import generateRanges from '../../../connectors/price-ranges/generate-ranges.js';
import PriceRanges from '../../../components/PriceRanges/PriceRanges.js';
import defaultTemplates from '../defaultTemplates.js';

const instantSearchInstance = { templatesConfig: undefined };

describe('priceRanges call', () => {
  it('throws an exception when no container', () => {
    const attributeName = '';
    expect(priceRanges.bind(null, { attributeName })).toThrow(/^Usage:/);
  });

  it('throws an exception when no attributeName', () => {
    const container = document.createElement('div');
    expect(priceRanges.bind(null, { container })).toThrow(/^Usage:/);
  });
});

describe('priceRanges()', () => {
  let ReactDOM;
  let container;
  let widget;
  let results;
  let helper;
  let state;
  let createURL;

  beforeEach(() => {
    ReactDOM = { render: sinon.spy() };

    priceRanges.__Rewire__('render', ReactDOM.render);

    container = document.createElement('div');
    widget = priceRanges({
      container,
      attributeName: 'aNumAttr',
      cssClasses: { root: ['root', 'cx'] },
    });
    results = {
      hits: [1],
      nbHits: 1,
      getFacetStats: sinon.stub().returns({
        min: 1.99,
        max: 4999.98,
        avg: 243.349,
        sum: 2433490.0,
      }),
    };
  });

  it('adds the attribute as a facet', () => {
    expect(widget.getConfiguration()).toEqual({ facets: ['aNumAttr'] });
  });

  describe('without refinements', () => {
    let props;

    beforeEach(() => {
      helper = {
        getRefinements: sinon.stub().returns([]),
        clearRefinements: sinon.spy(),
        addNumericRefinement: sinon.spy(),
        search: sinon.spy(),
      };

      state = {
        clearRefinements: sinon.stub().returnsThis(),
        addNumericRefinement: sinon.stub().returnsThis(),
      };

      createURL = sinon.stub().returns('#createURL');

      props = {
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
          root: 'ais-price-ranges root cx',
          separator: 'ais-price-ranges--separator',
        },
        collapsible: false,
        shouldAutoHideContainer: false,
        facetValues: generateRanges(results.getFacetStats()).map(facetValue => {
          facetValue.url = '#createURL';
          return facetValue;
        }),
        currency: '$',
        labels: {
          separator: 'to',
          button: 'Go',
        },
        refine() {},
        templateProps: {
          templates: defaultTemplates,
          templatesConfig: undefined,
          transformData: undefined,
          useCustomCompileOptions: {
            header: false,
            footer: false,
            item: false,
          },
        },
      };
      widget.init({ helper, instantSearchInstance });
    });

    it('calls twice ReactDOM.render(<PriceRanges props />, container)', () => {
      widget.render({ results, helper, state, createURL });
      widget.render({ results, helper, state, createURL });

      expect(ReactDOM.render.calledTwice).toBe(
        true,
        'ReactDOM.render called twice'
      );
      expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
        <PriceRanges {...props} />
      );
      expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
      expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(
        <PriceRanges {...props} />
      );
      expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
    });

    it('calls getRefinements to check if there are some refinements', () => {
      widget.render({ results, helper, state, createURL });
      expect(helper.getRefinements.calledOnce).toBe(
        true,
        'getRefinements called once'
      );
    });

    it('refines on the lower bound', () => {
      widget.refine({ from: 10, to: undefined });
      expect(helper.clearRefinements.calledOnce).toBe(
        true,
        'helper.clearRefinements called once'
      );
      expect(helper.addNumericRefinement.calledOnce).toBe(
        true,
        'helper.addNumericRefinement called once'
      );
      expect(helper.search.calledOnce).toBe(true, 'helper.search called once');
    });

    it('refines on the upper bound', () => {
      widget.refine({ from: undefined, to: 10 });
      expect(helper.clearRefinements.calledOnce).toBe(
        true,
        'helper.clearRefinements called once'
      );
      expect(helper.search.calledOnce).toBe(true, 'helper.search called once');
    });

    it('refines on the 2 bounds', () => {
      widget.refine({ from: 10, to: 20 });
      expect(helper.clearRefinements.calledOnce).toBe(
        true,
        'helper.clearRefinements called once'
      );
      expect(helper.addNumericRefinement.calledTwice).toBe(
        true,
        'helper.addNumericRefinement called twice'
      );
      expect(helper.search.calledOnce).toBe(true, 'helper.search called once');
    });
  });

  afterEach(() => {
    priceRanges.__ResetDependency__('render');
    priceRanges.__ResetDependency__('autoHideContainerHOC');
    priceRanges.__ResetDependency__('headerFooterHOC');
  });
});
