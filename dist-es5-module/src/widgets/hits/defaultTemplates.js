'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  empty: 'No results',
  item: function item(data) {
    return JSON.stringify(data, null, 2);
  }
};