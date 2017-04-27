'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _Template = require('../../Template');

var _Template2 = _interopRequireDefault(_Template);

var _PriceRanges = require('../PriceRanges');

var _PriceRanges2 = _interopRequireDefault(_PriceRanges);

var _PriceRangesForm = require('../PriceRangesForm');

var _PriceRangesForm2 = _interopRequireDefault(_PriceRangesForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);


describe('PriceRanges', function () {
  var renderer = void 0;
  var stubbedMethods = void 0;

  beforeEach(function () {
    stubbedMethods = [];
    var createRenderer = _reactAddonsTestUtils2.default.createRenderer;

    renderer = createRenderer();
  });

  afterEach(function () {
    // Restore all stubbed methods
    stubbedMethods.forEach(function (name) {
      _PriceRanges2.default.prototype[name].restore();
    });
  });

  function render() {
    var extraProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var props = _extends({}, extraProps);
    renderer.render(_react2.default.createElement(_PriceRanges2.default, props));
    return renderer.getRenderOutput();
  }

  function getComponentWithMockRendering(extraProps) {
    var props = _extends({}, extraProps);
    return _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_PriceRanges2.default, props));
  }

  function stubMethod(methodName) {
    var returnValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    stubbedMethods.push(methodName);
    return _sinon2.default.stub(_PriceRanges2.default.prototype, methodName).returns(returnValue);
  }

  context('individual methods', function () {
    beforeEach(function () {
      stubMethod('render');
    });

    context('getItemFromFacetValue', function () {
      var props = void 0;
      var facetValue = void 0;

      beforeEach(function () {
        props = {
          cssClasses: {
            item: 'item',
            link: 'link',
            active: 'active'
          },
          currency: '$'
        };
        facetValue = {
          from: 1,
          to: 10,
          isRefined: false,
          url: 'url'
        };
      });

      it('should display one range item correctly', function () {
        // Given
        var component = getComponentWithMockRendering(props);

        // When
        var item = component.getItemFromFacetValue(facetValue);

        // Then
        (0, _expect2.default)(item).toEqualJSX(_react2.default.createElement(
          'div',
          { className: 'item', key: '1_10' },
          _react2.default.createElement(
            'a',
            { className: 'link', href: 'url', onClick: function onClick() {} },
            _react2.default.createElement(_Template2.default, { data: _extends({ currency: '$' }, facetValue), templateKey: 'item' })
          )
        ));
      });
      it('should display one active range item correctly', function () {
        // Given
        var component = getComponentWithMockRendering(props);
        facetValue.isRefined = true;

        // When
        var item = component.getItemFromFacetValue(facetValue);

        // Then
        (0, _expect2.default)(item).toEqualJSX(_react2.default.createElement(
          'div',
          { className: 'item active', key: '1_10' },
          _react2.default.createElement(
            'a',
            { className: 'link', href: 'url', onClick: function onClick() {} },
            _react2.default.createElement(_Template2.default, { data: _extends({ currency: '$' }, facetValue), templateKey: 'item' })
          )
        ));
      });
    });

    context('refine', function () {
      it('should call refine from props', function () {
        // Given
        var mockEvent = { preventDefault: _sinon2.default.spy() };
        var props = {
          refine: _sinon2.default.spy()
        };
        var component = getComponentWithMockRendering(props);

        // When
        component.refine(1, 10, mockEvent);

        // Then
        (0, _expect2.default)(mockEvent.preventDefault.called).toBe(true);
        (0, _expect2.default)(props.refine.calledWith(1, 10)).toBe(true);
      });
    });

    context('getForm', function () {
      it('should call the PriceRangesForm', function () {
        // Given
        var props = {
          cssClasses: 'cssClasses',
          labels: { button: 'hello' },
          currency: '$',
          refine: 'refine',
          facetValues: [{ from: 0, to: 10 }, { from: 10, to: 20 }]
        };
        var component = getComponentWithMockRendering(props);

        // When
        var form = component.getForm();

        // Then
        (0, _expect2.default)(form).toEqualJSX(_react2.default.createElement(_PriceRangesForm2.default, {
          cssClasses: props.cssClasses,
          currentRefinement: { from: '', to: '' },
          labels: { button: 'hello', currency: '$' },
          refine: function refine() {}
        }));
      });
    });
  });

  context('render', function () {
    it('should have the right number of items', function () {
      // Given
      var mockedGetItem = stubMethod('getItemFromFacetValue');
      var props = {
        facetValues: [{}, {}, {}, {}]
      };

      // When
      render(props);

      // Then
      (0, _expect2.default)(mockedGetItem.called).toBe(true);
      (0, _expect2.default)(mockedGetItem.callCount).toBe(4);
    });
    it('should wrap the output in a list CSS class', function () {
      // Given
      stubMethod('getItemFromFacetValue', _react2.default.createElement('span', null));
      stubMethod('getForm', _react2.default.createElement('form', null));
      var props = {
        cssClasses: {
          list: 'list'
        },
        facetValues: [{}, {}, {}, {}]
      };

      // When
      var out = render(props);

      // Then
      (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: 'list' },
          _react2.default.createElement('span', null),
          _react2.default.createElement('span', null),
          _react2.default.createElement('span', null),
          _react2.default.createElement('span', null)
        ),
        _react2.default.createElement('form', null)
      ));
    });
    it('starts a refine on click', function () {
      // Given
      var mockRefined = stubMethod('refine');
      var props = {
        facetValues: [{ from: 1, to: 10, isRefined: false }],
        templateProps: {
          templates: {
            item: 'item'
          }
        }
      };
      var component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_PriceRanges2.default, props));
      var link = _reactAddonsTestUtils2.default.findRenderedDOMComponentWithTag(component, 'a');

      // When
      _reactAddonsTestUtils2.default.Simulate.click(link);

      // Then
      (0, _expect2.default)(mockRefined.called).toBe(true);
    });
  });
});