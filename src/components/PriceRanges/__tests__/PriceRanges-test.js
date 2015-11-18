/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import Template from '../../Template';
import PriceRanges from '../PriceRanges';
import PriceRangesForm from '../PriceRangesForm';

describe('PriceRanges', () => {
  let renderer;
  let stubbedMethods;

  jsdom({useEach: true});

  beforeEach(() => {
    stubbedMethods = [];
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  afterEach(() => {
    // Restore all stubbed methods
    stubbedMethods.forEach((name) => {
      PriceRanges.prototype[name].restore();
    });
  });

  function render(extraProps = {}) {
    let props = {
      ...extraProps
    };
    renderer.render(<PriceRanges {...props} />);
    return renderer.getRenderOutput();
  }

  function getComponentWithMockRendering(extraProps) {
    let props = {
      ...extraProps
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

    context('getURLFromFacetValue', () => {
      it('should be a # if no createURL method passed', () => {
        // Given
        let component = getComponentWithMockRendering({
          createURL: null
        });

        // When
        let url = component.getURLFromFacetValue();

        // Then
        expect(url).toEqual('#');
      });
      it('should call the createURL method passed with the facetValue', () => {
        // Given
        let mockCreateURL = sinon.spy();
        let component = getComponentWithMockRendering({
          createURL: mockCreateURL
        });
        let facetValue = {
          from: 6,
          to: 8,
          isRefined: true
        };

        // When
        component.getURLFromFacetValue(facetValue);

        // Then
        expect(mockCreateURL.called).toBe(true);
        expect(mockCreateURL.calledWith(6, 8, true)).toBe(true);
      });
    });

    context('getItemFromFacetValue', () => {
      let props;
      let facetValue;

      beforeEach(() => {
        stubMethod('getURLFromFacetValue', 'url');
        props = {
          cssClasses: {
            item: 'item',
            link: 'link',
            active: 'active'
          }
        };
        facetValue = {
          from: 1,
          to: 10,
          isRefined: false
        };
      });

      it('should display one range item correctly', () => {
        // Given
        let component = getComponentWithMockRendering(props);

        // When
        let item = component.getItemFromFacetValue(facetValue);

        // Then
        expect(item).toEqualJSX(
          <div className="item" key="1_10">
            <a className="link" href="url" onClick={() => {}}>
              <Template data={facetValue} templateKey="item"/>
            </a>
          </div>
        );
      });
      it('should display one active range item correctly', () => {
        // Given
        let component = getComponentWithMockRendering(props);
        facetValue.isRefined = true;

        // When
        let item = component.getItemFromFacetValue(facetValue);

        // Then
        expect(item).toEqualJSX(
          <div className="item active" key="1_10">
            <a className="link" href="url" onClick={() => {}}>
              <Template data={facetValue} templateKey="item"/>
            </a>
          </div>
        );
      });
    });

    context('refine', () => {
      it('should call refine from props', () => {
        // Given
        let mockEvent = {preventDefault: sinon.spy()};
        let props = {
          refine: sinon.spy()
        };
        let component = getComponentWithMockRendering(props);

        // When
        component.refine(1, 10, mockEvent);

        // Then
        expect(mockEvent.preventDefault.called).toBe(true);
        expect(props.refine.calledWith(1, 10)).toBe(true);
        expect(component.state.formFromValue).toBe(null);
        expect(component.state.formToValue).toBe(null);
      });
    });

    context('getForm', () => {
      it('should call the PriceRangesForm', () => {
        // Given
        let props = {
          cssClasses: 'cssClasses',
          labels: 'labels',
          refine: 'refine'
        };
        let component = getComponentWithMockRendering(props);

        // When
        let form = component.getForm();

        // Then
        expect(form).toEqualJSX(
          <PriceRangesForm
            cssClasses={props.cssClasses}
            labels={props.labels}
            refine={() => {}}
          />
        );
      });
    });
  });

  context('render', () => {
    it('should have the right number of items', () => {
      // Given
      let mockedGetItem = stubMethod('getItemFromFacetValue');
      let props = {
        facetValues: [{}, {}, {}, {}]
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
      let props = {
        cssClasses: {
          list: 'list'
        },
        facetValues: [{}, {}, {}, {}]
      };

      // When
      let out = render(props);

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
      let mockRefined = stubMethod('refine');
      let props = {
        facetValues: [{from: 1, to: 10, isRefined: false}],
        templateProps: {
          templates: {
            item: 'item'
          }
        }
      };
      let component = TestUtils.renderIntoDocument(<PriceRanges {...props} />);
      let link = TestUtils.findRenderedDOMComponentWithTag(component, 'a');

      // When
      TestUtils.Simulate.click(link);

      // Then
      expect(mockRefined.called).toBe(true);
    });
  });
});
