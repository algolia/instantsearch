'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _generateRanges = require('../generate-ranges');

var _generateRanges2 = _interopRequireDefault(_generateRanges);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

describe('generateRanges()', function () {
  it('should generate ranges', function () {
    var stats = {
      min: 1.01,
      max: 4999.98,
      avg: 243.349,
      sum: 2433490.0
    };
    var expected = [{ to: 2 }, { from: 2, to: 80 }, { from: 80, to: 160 }, { from: 160, to: 240 }, { from: 240, to: 1820 }, { from: 1820, to: 3400 }, { from: 3400, to: 4980 }, { from: 4980 }];
    (0, _expect2.default)((0, _generateRanges2.default)(stats)).toEqual(expected);
  });

  it('should generate small ranges', function () {
    var stats = { min: 20, max: 50, avg: 35, sum: 70 };
    var expected = [{ to: 20 }, { from: 20, to: 25 }, { from: 25, to: 30 }, { from: 30, to: 35 }, { from: 35, to: 40 }, { from: 40, to: 45 }, { from: 45 }];
    (0, _expect2.default)((0, _generateRanges2.default)(stats)).toEqual(expected);
  });

  it('should not do an infinite loop', function () {
    var stats = { min: 99.99, max: 149.99, avg: 124.99, sum: 249.98 };
    var expected = [{ to: 100 }, { from: 100, to: 110 }, { from: 110, to: 120 }, { from: 120, to: 130 }, { from: 130, to: 131 }, { from: 131, to: 132 }, { from: 132 }];
    (0, _expect2.default)((0, _generateRanges2.default)(stats)).toEqual(expected);
  });

  it('should not generate ranges', function () {
    var stats = { min: 20, max: 20, avg: 20, sum: 20 };
    (0, _expect2.default)((0, _generateRanges2.default)(stats)).toEqual([]);
  });
});