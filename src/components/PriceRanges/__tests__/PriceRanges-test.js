import React from 'react';
import sinon from 'sinon';
import {RawPriceRanges as PriceRanges} from '../PriceRanges';
import renderer from 'react-test-renderer';
import TestUtils from 'react-dom/test-utils';

describe('PriceRanges', () => {
  const defaultProps = {
    refine() {},
    templateProps: {
      templates: {
        item: '{{name}} {{value}} {{currency}}',
      },
    },
  };

  let stubbedMethods;

  beforeEach(() => {
    stubbedMethods = [];
  });

  afterEach(() => {
    // Restore all stubbed methods
    stubbedMethods.forEach(name => {
      PriceRanges.prototype[name].restore();
    });
  });

  function getComponentWithMockRendering(extraProps) {
    const props = {
      ...defaultProps,
      ...extraProps,
    };
    return TestUtils.renderIntoDocument(<PriceRanges {...props} />);
  }

  function stubMethod(methodName, returnValue = null) {
    stubbedMethods.push(methodName);
    return sinon.stub(PriceRanges.prototype, methodName).returns(returnValue);
  }

  describe('individual methods', () => {
    beforeEach(() => {
      stubMethod('render');
    });

    describe('getItemFromFacetValue', () => {
      let props;
      let facetValue;

      beforeEach(() => {
        props = {
          ...defaultProps,
          cssClasses: {
            item: 'item',
            link: 'link',
            active: 'active',
          },
          currency: '$',
        };
        facetValue = {
          from: 1,
          to: 10,
          isRefined: false,
          url: 'url',
        };
      });

      it('should display one range item correctly', () => {
        // Given
        const component = getComponentWithMockRendering(props);

        const tree = renderer.create(
          component.getItemFromFacetValue(facetValue)
        ).toJSON();
        expect(tree).toMatchSnapshot();
      });
      it('should display one active range item correctly', () => {
        // Given
        const component = getComponentWithMockRendering(props);
        facetValue.isRefined = true;

        const tree = renderer.create(
          component.getItemFromFacetValue(facetValue)
        ).toJSON();
        expect(tree).toMatchSnapshot();
      });
    });

    describe('refine', () => {
      it('should call refine from props', () => {
        // Given
        const mockEvent = {preventDefault: sinon.spy()};
        const props = {
          refine: sinon.spy(),
        };
        const component = getComponentWithMockRendering(props);

        // When
        component.refine({from: 1, to: 10}, mockEvent);

        // Then
        expect(mockEvent.preventDefault.called).toBe(true);
        expect(props.refine.calledWith({from: 1, to: 10})).toBe(true);
      });
    });

    describe('getForm', () => {
      it('should call the PriceRangesForm', () => {
        // Given
        const props = {
          cssClasses: {},
          labels: {button: 'hello'},
          currency: '$',
          refine() {},
          facetValues: [{from: 0, to: 10}, {from: 10, to: 20}],
        };
        const component = getComponentWithMockRendering(props);
        const tree = renderer.create(
          component.getForm()
        ).toJSON();
        expect(tree).toMatchSnapshot();
      });
    });
  });

  describe('render', () => {
    it('should have the right number of items', () => {
      const props = {
        ...defaultProps,
        facetValues: [{from: 0, to: 10}, {from: 1, to: 10}, {from: 2, to: 10}, {from: 3, to: 10}],
      };
      const tree = renderer.create(
        <PriceRanges {...props} />
      ).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should wrap the output in a list CSS class', () => {
      const props = {
        ...defaultProps,
        cssClasses: {
          list: 'list',
        },
        facetValues: [{from: 0, to: 10}, {from: 1, to: 10}, {from: 2, to: 10}, {from: 3, to: 10}],
      };
      const tree = renderer.create(
        <PriceRanges {...props} />
      ).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('starts a refine on click', () => {
      // Given
      const mockRefined = stubMethod('refine');
      const props = {
        ...defaultProps,
        facetValues: [{from: 1, to: 10, isRefined: false}],
        templateProps: {
          templates: {
            item: 'item',
          },
        },
      };
      const component = TestUtils.renderIntoDocument(<PriceRanges {...props} />);
      const link = TestUtils.findRenderedDOMComponentWithTag(component, 'a');

      // When
      TestUtils.Simulate.click(link);

      // Then
      expect(mockRefined.called).toBe(true);
    });
  });
});
