/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import Template from '../../Template';
import PriceRanges from '../PriceRanges';
import PriceRangesForm from '../PriceRangesForm';

describe('PriceRanges', () => {
  let renderer;
  let stubbedMethods;

  beforeEach(() => {
    stubbedMethods = [];
    const {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  afterEach(() => {
    // Restore all stubbed methods
    stubbedMethods.forEach(name => {
      PriceRanges.prototype[name].restore();
    });
  });

  function render(extraProps = {}) {
    const props = {
      ...extraProps,
    };
    renderer.render(<PriceRanges {...props} />);
    return renderer.getRenderOutput();
  }

  function getComponentWithMockRendering(extraProps) {
    const props = {
      ...extraProps,
    };
    return TestUtils.renderIntoDocument(<PriceRanges {...props} />);
  }

  function stubMethod(methodName, returnValue = null) {
    stubbedMethods.push(methodName);
    return sinon.stub(PriceRanges.prototype, methodName).returns(returnValue);
  }

  context('individual methods', () => {
    beforeEach(() => {
      stubMethod('render');
    });

    context('getItemFromFacetValue', () => {
      let props;
      let facetValue;

      beforeEach(() => {
        props = {
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

        // When
        const item = component.getItemFromFacetValue(facetValue);

        // Then
        expect(item).toEqualJSX(
          <div className="item" key="1_10">
            <a className="link" href="url" onClick={() => {}}>
              <Template data={{currency: '$', ...facetValue}} templateKey="item"/>
            </a>
          </div>
        );
      });
      it('should display one active range item correctly', () => {
        // Given
        const component = getComponentWithMockRendering(props);
        facetValue.isRefined = true;

        // When
        const item = component.getItemFromFacetValue(facetValue);

        // Then
        expect(item).toEqualJSX(
          <div className="item active" key="1_10">
            <a className="link" href="url" onClick={() => {}}>
              <Template data={{currency: '$', ...facetValue}} templateKey="item"/>
            </a>
          </div>
        );
      });
    });

    context('refine', () => {
      it('should call refine from props', () => {
        // Given
        const mockEvent = {preventDefault: sinon.spy()};
        const props = {
          refine: sinon.spy(),
        };
        const component = getComponentWithMockRendering(props);

        // When
        component.refine(1, 10, mockEvent);

        // Then
        expect(mockEvent.preventDefault.called).toBe(true);
        expect(props.refine.calledWith(1, 10)).toBe(true);
      });
    });

    context('getForm', () => {
      it('should call the PriceRangesForm', () => {
        // Given
        const props = {
          cssClasses: 'cssClasses',
          labels: {button: 'hello'},
          currency: '$',
          refine: 'refine',
          facetValues: [{from: 0, to: 10}, {from: 10, to: 20}],
        };
        const component = getComponentWithMockRendering(props);

        // When
        const form = component.getForm();

        // Then
        expect(form).toEqualJSX(
          <PriceRangesForm
            cssClasses={props.cssClasses}
            currentRefinement={{from: '', to: ''}}
            labels={{button: 'hello', currency: '$'}}
            refine={() => {}}
          />
        );
      });
    });
  });

  context('render', () => {
    it('should have the right number of items', () => {
      // Given
      const mockedGetItem = stubMethod('getItemFromFacetValue');
      const props = {
        facetValues: [{}, {}, {}, {}],
      };

      // When
      render(props);

      // Then
      expect(mockedGetItem.called).toBe(true);
      expect(mockedGetItem.callCount).toBe(4);
    });
    it('should wrap the output in a list CSS class', () => {
      // Given
      stubMethod('getItemFromFacetValue', <span />);
      stubMethod('getForm', <form />);
      const props = {
        cssClasses: {
          list: 'list',
        },
        facetValues: [{}, {}, {}, {}],
      };

      // When
      const out = render(props);

      // Then
      expect(out).toEqualJSX(
        <div>
          <div className="list">
            <span />
            <span />
            <span />
            <span />
          </div>
          <form />
        </div>
      );
    });
    it('starts a refine on click', () => {
      // Given
      const mockRefined = stubMethod('refine');
      const props = {
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
