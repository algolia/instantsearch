'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _menu = require('../menu');

var _menu2 = _interopRequireDefault(_menu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

describe('menu', function () {
  it('throws an exception when no attributeName', function () {
    var container = document.createElement('div');
    (0, _expect2.default)(_menu2.default.bind(null, { container: container })).toThrow(/^Usage/);
  });

  it('throws an exception when no container', function () {
    var attributeName = '';
    (0, _expect2.default)(_menu2.default.bind(null, { attributeName: attributeName })).toThrow(/^Usage/);
  });
});