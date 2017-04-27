'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* eslint-env mocha */

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _main = require('../main.js');

var _main2 = _interopRequireDefault(_main);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('instantsearch()', function () {
  // to ensure the global.window is set

  it('includes a version', function () {
    (0, _expect2.default)(_main2.default.version).toBeA('string');
  });

  it('statically creates a URL', function () {
    (0, _expect2.default)(_main2.default.createQueryString({ hitsPerPage: 42 })).toEqual('hPP=42');
  });

  it('statically creates a complex URL', function () {
    (0, _expect2.default)(_main2.default.createQueryString({ hitsPerPage: 42, facetsRefinements: { category: 'Home' } })).toEqual('hPP=42&fR[category]=Home');
  });

  it('includes the widget functions', function () {
    (0, _forEach2.default)(_main2.default.widgets, function (widget) {
      (0, _expect2.default)(typeof widget === 'undefined' ? 'undefined' : _typeof(widget)).toEqual('function', 'A widget must be a function');
    });
  });
});