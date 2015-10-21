/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import PriceRanges from '../PriceRanges';
import generateRanges from '../../widgets/price-ranges/generate-ranges.js';

describe('PriceRanges', () => {
  var renderer;

  jsdom({useEach: true});

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  context('with stats', () => {
    var out;
    var facetValues;
    var props;

    beforeEach(() => {
      facetValues = generateRanges({
        min: 1.99,
        max: 4999.98,
        avg: 243.349,
        sum: 2433490.0
      });

      props = {
        templateProps: {},
        facetValues,
        cssClasses: {
          range: 'range-class',
          form: 'form-class',
          button: 'button-class',
          input: 'input-class'
        },
        labels: {
          currency: 'USD',
          to: 'to',
          button: 'Go'
        },
        refine: sinon.spy()
      };

      renderer.render(<PriceRanges {...props} />);
      out = renderer.getRenderOutput();
    });

    it('should have the right number of children', () => {
      expect(out.props.children.length).toEqual(2);
      expect(out.props.children[0].length).toEqual(facetValues.length);
    });

    it('should have the range class', () => {
      out.props.children[0].forEach((c) => {
        expect(c.props.className).toEqual('range-class');
      });
    });

    it('should have the form class', () => {
      expect(out.props.children.length).toEqual(2);
      expect(out.props.children[1].props.className).toEqual('form-class');
    });

    it('should display the inputs with the associated class & labels', () => {
      expect(out.props.children.length).toEqual(2);
      expect(out.props.children[1]).toEqualJSX(
        <form className="form-class" onSubmit={() => {}}>
          <label>
            USD{' '}<input className="input-class" ref="from" type="number" />
          </label>
          {' '}to{' '}
          <label>
            USD{' '}<input className="input-class" ref="to" type="number" />
          </label>
          {' '}
          <button className="button-class" type="submit">Go</button>
        </form>
      );
    });

    it('refine on submit', () => {
      // cannot currently use shallow rendering to test refs
      props.templateProps = {
        templates: {header: '', range: '', footer: ''},
        templatesConfig: {},
        transformData: undefined,
        useCustomCompileOptions: {header: false, footer: false, range: false}
      };

      let eventData = {preventDefault: sinon.spy()};
      let component = TestUtils.renderIntoDocument(<PriceRanges {...props} />);
      component.refs.from.value = 10;
      component.refs.to.value = 20;
      TestUtils.Simulate.change(component.refs.from);
      TestUtils.Simulate.change(component.refs.to);
      TestUtils.Simulate.submit(component.refs.form, eventData);
      expect(props.refine.firstCall.args).toEqual([10, 20]);
      expect(eventData.preventDefault.calledOnce).toBe(true);
    });
  });
});
