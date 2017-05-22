import React from 'react';
import TestUtils from 'react-dom/test-utils';
import sinon from 'sinon';
import PriceRangesForm from '../PriceRangesForm';
import renderer from 'react-test-renderer';

describe('PriceRangesForm', () => {
  describe('display', () => {
    it('should pass all css classes and labels', () => {
      const props = {
        refine() {},
        labels: {
          currency: '$',
          separator: 'to',
          button: 'Go',
        },
        cssClasses: {
          form: 'form',
          label: 'label',
          input: 'input',
          currency: 'currency',
          separator: 'separator',
          button: 'button',
        },
        currentRefinement: {
          from: 10,
          to: 20,
        },
      };

      const tree = renderer.create(
        <PriceRangesForm {...props} />
      ).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('submit', () => {
    it('starts a refine on submit', () => {
      // Given
      const refine = sinon.spy();
      const handleSubmitMock = sinon.spy(PriceRangesForm.prototype, 'handleSubmit');
      const component = TestUtils.renderIntoDocument(
        <PriceRangesForm
          currentRefinement={{
            from: 10,
            to: 20,
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
