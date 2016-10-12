'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  header: '',
  item: '<label class="{{cssClasses.label}}">\n  <input type="checkbox" class="{{cssClasses.checkbox}}" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}}\n  <span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>\n</label>',
  footer: ''
};