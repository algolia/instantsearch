/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import PriceRangesForm from '../PriceRangesForm';

describe('PriceRangesForm', () => {
  var renderer;

  jsdom({useEach: true});

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  function render(extraProps = {}) {
    var props = {
      ...extraProps
    };
    renderer.render(<PriceRangesForm {...props} />);
    return renderer.getRenderOutput();
  }

  context('display', () => {
    it('should pass all css classes and labels', () => {
      let out = render({
        labels: {
          currency: '$',
          separator: 'to',
          button: 'Go'
        },
        cssClasses: {
          form: 'form',
          label: 'label',
          input: 'input',
          currency: 'currency',
          separator: 'separator',
          button: 'button'
        }
      });
      expect(out).toEqualJSX(
        <form className="form" onSubmit={() => {}} ref="form">
          <label className="label">
            <span className="currency">$ </span>
            <input className="input" ref="from" type="number" />
          </label>
          <span className="separator"> to </span>
          <label className="label">
            <span className="currency">$ </span>
            <input className="input" ref="to" type="number" />
          </label>
          <button className="button" type="submit">Go</button>
        </form>
      );
    });
  });

  context('submit', () => {
    it('starts a refine on submit', () => {
      // Given
      let refine = sinon.spy();
      let handleSubmitMock = sinon.spy(PriceRangesForm.prototype, 'handleSubmit');
      let component = TestUtils.renderIntoDocument(<PriceRangesForm refine={refine} />);

      // When
      component.refs.from.value = 10;
      TestUtils.Simulate.change(component.refs.from);
      component.refs.to.value = 20;
      TestUtils.Simulate.change(component.refs.to);
      TestUtils.Simulate.submit(component.refs.form);

      // Then
      expect(handleSubmitMock.calledOnce).toBe(true);
      expect(refine.calledWith(10, 20)).toBe(true);
    });
  });
});
