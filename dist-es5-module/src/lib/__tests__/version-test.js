'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _version = require('../version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

describe('version', function () {
  it('includes the latest version', function () {
    (0, _expect2.default)(_version2.default).toBeA('string');
  });
});