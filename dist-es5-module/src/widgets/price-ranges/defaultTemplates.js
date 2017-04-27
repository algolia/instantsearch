'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  header: '',
  item: '\n    {{#from}}\n      {{^to}}\n        &ge;\n      {{/to}}\n      {{currency}}{{from}}\n    {{/from}}\n    {{#to}}\n      {{#from}}\n        -\n      {{/from}}\n      {{^from}}\n        &le;\n      {{/from}}\n      {{to}}\n    {{/to}}\n  ',
  footer: ''
};