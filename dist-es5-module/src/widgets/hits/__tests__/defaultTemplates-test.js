'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _defaultTemplates = require('../defaultTemplates');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

describe('hits defaultTemplates', function () {
  it('has a `empty` default template', function () {
    (0, _expect2.default)(_defaultTemplates2.default.empty).toBe('No results');
  });

  it('has a `item` default template', function () {
    var item = {
      hello: 'there,',
      how: {
        are: 'you?'
      }
    };

    var expected = '{\n  "hello": "there,",\n  "how": {\n    "are": "you?"\n  }\n}';

    (0, _expect2.default)(_defaultTemplates2.default.item(item)).toBe(expected);
  });
});