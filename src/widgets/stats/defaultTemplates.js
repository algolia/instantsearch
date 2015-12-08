export default {
  header: '',
  body: `{{#hasNoResults}}No results{{/hasNoResults}}
  {{#hasOneResult}}1 result{{/hasOneResult}}
  {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}
  <span class="{{cssClasses.time}}">found in {{processingTimeMS}}ms</span>`,
  footer: ''
};
