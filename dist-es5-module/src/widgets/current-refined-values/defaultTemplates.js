'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  header: '',
  item: '' + '{{#label}}' + '{{label}}' + '{{^operator}}:{{/operator}}' + ' ' + '{{/label}}' + '{{#operator}}{{{displayOperator}}} {{/operator}}' + '{{#exclude}}-{{/exclude}}' + '{{name}} <span class="{{cssClasses.count}}">{{count}}</span>',
  clearAll: 'Clear all',
  footer: ''
};