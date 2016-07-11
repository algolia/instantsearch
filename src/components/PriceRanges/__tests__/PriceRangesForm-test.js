/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import PriceRangesForm from '../PriceRangesForm';

describe('PriceRangesForm', () => {
  let renderer;
  beforeEach(() => {
    const {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  function render(extraProps = {}) {
    const props = {
      ...extraProps
    };
    renderer.render(<PriceRangesForm {...props} />);
    return renderer.getRenderOutput();
  }

  context('display', () => {
    it('should pass all css classes and labels', () => {
      const out = render({
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
        },
        currentRefinement: {
          from: 10,
          to: 20
        }
      });
      expect(out).toEqualJSX(
        <form className="form" onSubmit={() => {}} ref="form">
          <label className="label">
            <span className="currency">$ </span>
            <input className="input" onChange={() => {}} ref="from" type="number" value={10} />
          </label>
          <span className="separator"> to </span>
          <label className="label">
            <span className="currency">$ </span>
            <input className="input" onChange={() => {}} ref="to" type="number" value={20} />
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
      const handleSubmitMock = sinon.spy(PriceRangesForm.prototype, 'handleSubmit');
      const component = TestUtils.renderIntoDocument(
        <PriceRangesForm
          currentRefinement={{
            from: 10,
            to: 20
          }}
          refine={refine}
        />
      );

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
