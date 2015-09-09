/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import PriceRanges from '../PriceRanges';
import generateRanges from '../../widgets/price-ranges/generate-ranges.js';

describe('PriceRanges', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  context('with stats', () => {
    var out;
    var facetValues;

    beforeEach(() => {
      facetValues = generateRanges({
        min: 1.99,
        max: 4999.98,
        avg: 243.349,
        sum: 2433490.0
      });

      var props = {
        templateProps: {},
        facetValues,
        cssClasses: {
          root: 'root-class',
          range: 'range-class',
          inputGroup: 'input-group-class',
          button: 'button-class',
          input: 'input-class'
        },
        labels: {
          currency: 'USD',
          to: 'to',
          button: 'Go'
        },
        refine: () => {}
      };

      renderer.render(<PriceRanges {...props} />);
      out = renderer.getRenderOutput();
    });

    it('should add the root class', () => {
      expect(out.type).toBe('div');
      expect(out.props.className).toEqual('root-class');
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

    it('should have the input group class', () => {
      expect(out.props.children.length).toEqual(2);
      expect(out.props.children[1].props.className).toEqual('input-group-class');
    });

    it('should display the inputs with the associated class & labels', () => {
      expect(out.props.children.length).toEqual(2);
      var click = out.props.children[1].props.children[6].props.onClick;
      expect(out.props.children[1]).toEqual(
        <div className="input-group-class">
          <label>
            USD{' '}<input className="input-class" ref="from" type="number" />
          </label>
          {' '}to{' '}
          <label>
            USD{' '}<input className="input-class" ref="to" type="number" />
          </label>
          {' '}
          <button className="button-class" onClick={click}>Go</button>
        </div>
      );
    });
  });
});
