'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  header: '',
  body: '{{#hasNoResults}}No results{{/hasNoResults}}\n  {{#hasOneResult}}1 result{{/hasOneResult}}\n  {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}\n  <span class="{{cssClasses.time}}">found in {{processingTimeMS}}ms</span>',
  footer: ''
};