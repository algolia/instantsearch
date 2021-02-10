export default {
  text: `
    {{#isSmartSorted}}
      {{#helpers.formatNumber}}{{nbSortedHits}}{{/helpers.formatNumber}}
      relevant
      {{#hasManySortedHits}}results{{/hasManySortedHits}}{{^hasManySortedHits}}result{{/hasManySortedHits}}
      sorted out of {{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}}
    {{/isSmartSorted}}
    {{^isSmartSorted}}
      {{#hasNoResults}}No results{{/hasNoResults}}
      {{#hasOneResult}}1 result{{/hasOneResult}}
      {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}
    {{/isSmartSorted}}
    found in {{processingTimeMS}}ms`,
};
