const { stats } = window.instantsearch.widgets;

export const resultsNumberMobile = stats({
  container: '[data-widget="results-number-mobile"]',
  templates: {
    text: '<strong>{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}}</strong> results',
  },
});
