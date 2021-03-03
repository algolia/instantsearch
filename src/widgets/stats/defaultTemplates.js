export default {
  text: `
    {{#areHitsSorted}}
      {{#hasNoSortedResults}}No relevant results{{/hasNoSortedResults}}
      {{#hasOneSortedResults}}1 relevant result{{/hasOneSortedResults}}
      {{#hasManySortedResults}}{{#helpers.formatNumber}}{{nbSortedHits}}{{/helpers.formatNumber}} relevant results{{/hasManySortedResults}}
      sorted out of {{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}}
    {{/areHitsSorted}}
    {{^areHitsSorted}}
      {{#hasNoResults}}No results{{/hasNoResults}}
      {{#hasOneResult}}1 result{{/hasOneResult}}
      {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}
    {{/areHitsSorted}}
    found in {{processingTimeMS}}ms`,
};
