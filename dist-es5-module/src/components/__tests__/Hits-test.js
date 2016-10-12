'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _enzyme = require('enzyme');

var _Hits = require('../Hits');

var _Hits2 = _interopRequireDefault(_Hits);

var _Template = require('../Template');

var _Template2 = _interopRequireDefault(_Template);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Hits', function () {
  function shallowRender() {
    var extraProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var props = _extends({
      cssClasses: {}
    }, extraProps);
    return (0, _enzyme.shallow)(_react2.default.createElement(_Hits2.default, props));
  }

  describe('no results', function () {
    it('should use the empty template if no results', function () {
      // Given
      var props = {
        results: {
          hits: []
        }
      };

      // When
      var actual = shallowRender(props);

      // Then
      (0, _expect2.default)(actual.props().templateKey).toEqual('empty');
    });

    it('should set the empty CSS class when no results', function () {
      // Given
      var props = {
        results: {
          hits: []
        },
        cssClasses: {
          root: 'my_root',
          empty: 'my_empty'
        }
      };

      // When
      var actual = shallowRender(props);

      // Then
      (0, _expect2.default)(actual.props().rootProps.className).toContain('my_empty');
      (0, _expect2.default)(actual.props().rootProps.className).toContain('my_root');
    });
  });

  describe('allItems template', function () {
    it('should use the allItems template if defined', function () {
      // Given
      var props = {
        results: {
          hits: [{
            foo: 'bar'
          }]
        },
        templateProps: {
          templates: {
            allItems: 'all items'
          }
        }
      };

      // When
      var actual = shallowRender(props);

      // Then
      (0, _expect2.default)(actual.props().templateKey).toEqual('allItems');
    });

    it('should set the allItems CSS class to the template', function () {
      // Given
      var props = {
        results: {
          hits: [{
            foo: 'bar'
          }]
        },
        templateProps: {
          templates: {
            allItems: 'all items'
          }
        },
        cssClasses: {
          root: 'my_root',
          allItems: 'my_all_items'
        }
      };

      // When
      var actual = shallowRender(props);

      // Then
      (0, _expect2.default)(actual.props().rootProps.className).toContain('my_all_items');
      (0, _expect2.default)(actual.props().rootProps.className).toContain('my_root');
    });

    it('should pass the list of all results to the template', function () {
      // Given
      var results = {
        hits: [{
          foo: 'bar'
        }]
      };
      var props = {
        results: results,
        templateProps: {
          templates: {
            allItems: 'all items'
          }
        }
      };

      // When
      var actual = shallowRender(props);

      // Then
      (0, _expect2.default)(actual.props().data).toEqual(results);
    });
  });

  describe('individual item templates', function () {
    it('should add an item template for each hit', function () {
      // Given
      var props = {
        results: {
          hits: [{
            foo: 'bar'
          }, {
            foo: 'baz'
          }]
        },
        templateProps: {
          templates: {
            item: 'one item'
          }
        }
      };

      // When
      var actual = shallowRender(props).find(_Template2.default);

      // Then
      (0, _expect2.default)(actual.length).toEqual(2);
      (0, _expect2.default)(actual.at(0).props().templateKey).toEqual('item');
    });

    it('should set the item class to each item', function () {
      // Given
      var props = {
        results: {
          hits: [{
            foo: 'bar'
          }]
        },
        templateProps: {
          templates: {
            item: 'one item'
          }
        },
        cssClasses: {
          item: 'my_item'
        }
      };

      // When
      var actual = shallowRender(props).find(_Template2.default);

      // Then
      (0, _expect2.default)(actual.props().rootProps.className).toContain('my_item');
    });

    it('should wrap the items in a root div element', function () {
      // Given
      var props = {
        results: {
          hits: [{
            foo: 'bar'
          }, {
            foo: 'baz'
          }]
        },
        templateProps: {
          templates: {
            item: 'one item'
          }
        },
        cssClasses: {
          root: 'my_root'
        }
      };

      // When
      var actual = shallowRender(props);

      // Then
      (0, _expect2.default)(actual.name()).toEqual('div');
      (0, _expect2.default)(actual.props().className).toContain('my_root');
    });

    it('should pass each result data to each item template', function () {
      // Given
      var props = {
        results: {
          hits: [{
            foo: 'bar'
          }, {
            foo: 'baz'
          }]
        },
        templateProps: {
          templates: {
            item: 'one item'
          }
        }
      };

      // When
      var actual = shallowRender(props).find({ templateKey: 'item' });

      // Then
      (0, _expect2.default)(actual.at(0).props().data.foo).toEqual('bar');
      (0, _expect2.default)(actual.at(1).props().data.foo).toEqual('baz');
    });

    it('should add the __hitIndex in the list to each item', function () {
      // Given
      var props = {
        results: {
          hits: [{
            foo: 'bar'
          }, {
            foo: 'baz'
          }]
        },
        templateProps: {
          templates: {
            item: 'one item'
          }
        }
      };

      // When
      var actual = shallowRender(props).find({ templateKey: 'item' });

      // Then
      (0, _expect2.default)(actual.at(0).props().data.__hitIndex).toEqual(0);
      (0, _expect2.default)(actual.at(1).props().data.__hitIndex).toEqual(1);
    });

    it('should use the objectID as the DOM key', function () {
      // Given
      var props = {
        results: {
          hits: [{
            objectID: 'BAR',
            foo: 'bar'
          }, {
            objectID: 'BAZ',
            foo: 'baz'
          }]
        },
        templateProps: {
          templates: {
            item: 'one item'
          }
        }
      };

      // When
      var actual = shallowRender(props).find({ templateKey: 'item' });

      // Then
      (0, _expect2.default)(actual.at(0).key()).toEqual('BAR');
      (0, _expect2.default)(actual.at(1).key()).toEqual('BAZ');
    });
  });
});