import { stats } from 'instantsearch.js/es/widgets';

const resultsNumber = stats({
  container: '[data-widget="results-number-mobile"]',
  templates: {
    text: '<strong>{{nbHits}}</strong> results',
  },
});

export default resultsNumber;
