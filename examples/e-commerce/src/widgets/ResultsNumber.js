import { stats } from 'instantsearch.js/es/widgets';

const searchBox = stats({
  container: '[data-widget="results-number"]',
  templates: {
    text: '<strong>{{nbHits}}</strong> results',
  },
});

export default searchBox;
