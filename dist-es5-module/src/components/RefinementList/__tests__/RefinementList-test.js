'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _RefinementList = require('../RefinementList');

var _RefinementList2 = _interopRequireDefault(_RefinementList);

var _RefinementListItem = require('../RefinementListItem');

var _RefinementListItem2 = _interopRequireDefault(_RefinementListItem);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('RefinementList', function () {
  var createURL = void 0;

  function shallowRender() {
    var extraProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    createURL = _sinon2.default.spy();
    var props = _extends({
      createURL: createURL,
      facetValues: []
    }, extraProps);
    return (0, _enzyme.shallow)(_react2.default.createElement(_RefinementList2.default, props));
  }

  describe('cssClasses', function () {
    it('should add the `list` class to the root element', function () {
      // Given
      var props = {
        cssClasses: {
          list: 'list'
        }
      };

      // When
      var actual = shallowRender(props);

      // Then
      (0, _expect2.default)(actual.hasClass('list')).toEqual(true);
    });

    it('should set item classes to the refinements', function () {
      // Given
      var props = {
        cssClasses: {
          item: 'item'
        },
        facetValues: [{ name: 'foo', isRefined: true }]
      };

      // When
      var actual = shallowRender(props).find(_RefinementListItem2.default);

      // Then
      (0, _expect2.default)(actual.props().itemClassName).toContain('item');
    });

    it('should set active classes to the active refinements', function () {
      // Given
      var props = {
        cssClasses: {
          active: 'active'
        },
        facetValues: [{ name: 'foo', isRefined: true }, { name: 'bar', isRefined: false }]
      };

      // When
      var activeItem = shallowRender(props).find({ isRefined: true });
      var inactiveItem = shallowRender(props).find({ isRefined: false });

      // Then
      (0, _expect2.default)(activeItem.props().itemClassName).toContain('active');
      (0, _expect2.default)(inactiveItem.props().itemClassName).toNotContain('active');
    });
  });

  describe('items', function () {
    it('should have the correct names', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo', isRefined: false }, { name: 'bar', isRefined: false }]
      };

      // When
      var items = shallowRender(props).find(_RefinementListItem2.default);
      var firstItem = items.at(0);
      var secondItem = items.at(1);

      // Then
      (0, _expect2.default)(firstItem.props().facetValueToRefine).toEqual('foo');
      (0, _expect2.default)(secondItem.props().facetValueToRefine).toEqual('bar');
    });

    it('understands attributeNameKey', function () {
      // Given
      var props = {
        facetValues: [{ name: 'no', youpiName: 'hello' }],
        attributeNameKey: 'youpiName'
      };

      // When
      var items = shallowRender(props).find(_RefinementListItem2.default);
      var item = items.at(0);

      // Then
      (0, _expect2.default)(item.props().facetValueToRefine).toEqual('hello');
      (0, _expect2.default)(createURL.calledOnce).toBe(true);
      (0, _expect2.default)(createURL.args[0][0]).toBe('hello');
    });

    it('should correctly set if refined or not', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo', isRefined: false }, { name: 'bar', isRefined: true }]
      };

      // When
      var items = shallowRender(props).find(_RefinementListItem2.default);
      var firstItem = items.at(0);
      var secondItem = items.at(1);

      // Then
      (0, _expect2.default)(firstItem.props().isRefined).toEqual(false);
      (0, _expect2.default)(secondItem.props().isRefined).toEqual(true);
    });
  });

  describe('count', function () {
    it('should pass the count to the templateData', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo', count: 42 }, { name: 'bar', count: 16 }]
      };

      // When
      var items = shallowRender(props).find(_RefinementListItem2.default);
      var firstItem = items.at(0);
      var secondItem = items.at(1);

      // Then
      (0, _expect2.default)(firstItem.props().templateData.count).toEqual(42);
      (0, _expect2.default)(secondItem.props().templateData.count).toEqual(16);
    });
  });

  describe('showMore', function () {
    it('displays a number of items equal to the limit when showMore: false', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }],
        showMore: false,
        limitMin: 2
      };

      // When
      var actual = shallowRender(props).find(_RefinementListItem2.default);

      // Then
      (0, _expect2.default)(actual.length).toEqual(2);
    });

    it('displays a number of items equal to the limit when showMore: true but not enabled', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }],
        showMore: true,
        limitMin: 2,
        limitMax: 3
      };

      // When
      var actual = shallowRender(props).find(_RefinementListItem2.default);

      // Then
      (0, _expect2.default)(actual.length).toEqual(2);
    });

    it('displays a number of items equal to the showMore limit when showMore: true and enabled', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }],
        limitMin: 2,
        limitMax: 3,
        showMore: true
      };

      // When
      var root = shallowRender(props);
      root.setState({ isShowMoreOpen: true });
      var actual = root.find(_RefinementListItem2.default);

      // Then
      (0, _expect2.default)(actual.length).toEqual(3);
    });

    it('adds a showMore link when the feature is enabled', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }],
        showMore: true,
        limitMin: 2,
        limitMax: 3
      };

      // When
      var root = shallowRender(props);
      var actual = root.find('Template').filter({ templateKey: 'show-more-inactive' });

      // Then
      (0, _expect2.default)(actual.length).toEqual(1);
    });

    it('does not add a showMore link when the feature is disabled', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }],
        showMore: false,
        limitMin: 2,
        limitMax: 3
      };

      // When
      var root = shallowRender(props);
      var actual = root.find('Template').filter({ templateKey: 'show-more-inactive' });

      // Then
      (0, _expect2.default)(actual.length).toEqual(0);
    });

    it('no showMore when: state = open -> values change -> values <= limitMin ', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }],
        showMore: true,
        limitMin: 2,
        limitMax: 5
      };

      // When
      var root = shallowRender(props);
      root.instance().handleClickShowMore();
      root.setProps({ facetValues: props.facetValues.slice(2) });

      // Then
      (0, _expect2.default)(root.find({ templateKey: 'show-more-active' }).length).toEqual(0);
    });

    it('does not add a showMore link when the facet values length is equal to the minLimit', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }],
        showMore: true,
        limitMin: 3,
        limitMax: 4
      };

      // When
      var root = shallowRender(props);
      var actual = root.find('Template').filter({ templateKey: 'show-more-inactive' });

      // Then
      (0, _expect2.default)(actual.length).toEqual(0);
    });

    it('changing the state will toggle the number of items displayed', function () {
      // Given
      var props = {
        facetValues: [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }],
        limitMin: 2,
        limitMax: 3,
        showMore: true
      };

      // When
      var root = shallowRender(props);

      // Then: Not opened, initial number displayed
      (0, _expect2.default)(root.find(_RefinementListItem2.default).length).toEqual(2);

      // Then: Toggling the state, display the limitMax
      root.setState({ isShowMoreOpen: true });
      (0, _expect2.default)(root.find(_RefinementListItem2.default).length).toEqual(3);

      // Then: Toggling the state again, back to the limitMin
      root.setState({ isShowMoreOpen: false });
      (0, _expect2.default)(root.find(_RefinementListItem2.default).length).toEqual(2);
    });
  });

  describe('sublist', function () {
    it('should create a subList with the sub values', function () {
      // Given
      var props = {
        facetValues: [{
          name: 'foo',
          data: [{ name: 'bar' }, { name: 'baz' }]
        }]
      };

      // When
      var root = shallowRender(props);
      var mainItem = root.find(_RefinementListItem2.default).at(0);
      var subList = (0, _enzyme.shallow)(mainItem.props().subItems);
      var subItems = subList.find(_RefinementListItem2.default);

      // Then
      (0, _expect2.default)(mainItem.props().facetValueToRefine).toEqual('foo');
      (0, _expect2.default)(subItems.at(0).props().facetValueToRefine).toEqual('bar');
      (0, _expect2.default)(subItems.at(1).props().facetValueToRefine).toEqual('baz');
    });

    it('should add depth class for each depth', function () {
      // Given
      var props = {
        cssClasses: {
          depth: 'depth-'
        },
        facetValues: [{
          name: 'foo',
          data: [{ name: 'bar' }, { name: 'baz' }]
        }]
      };

      // When
      var root = shallowRender(props);
      var mainItem = root.find(_RefinementListItem2.default).at(0);
      var subList = (0, _enzyme.shallow)(mainItem.props().subItems);

      // Then
      (0, _expect2.default)(root.props().className).toContain('depth-0');
      (0, _expect2.default)(subList.props().className).toContain('depth-1');
    });
  });
});