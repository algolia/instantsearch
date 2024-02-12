import { stats } from 'instantsearch.js/es/widgets';

export const resultsNumberMobile = stats({
  container: '[data-widget="results-number-mobile"]',
  templates: {
    text({ nbHits }, { html }) {
      return html`<strong>${nbHits.toLocaleString()}</strong> results`;
    },
  },
});
