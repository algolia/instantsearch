export default {
  text: `{{#hasNoResults}}No results{{/hasNoResults}}
    {{#hasOneResult}}1 result{{/hasOneResult}}
    {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}} found in {{processingTimeMS}}ms`,
};
