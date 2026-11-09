import { stats } from 'instantsearch.js';
export const seeResults = stats({
  container: '[data-widget="see-results-button"]',
  templates: {
    text({ nbHits }, { html }) {
      return html` See ${nbHits.toLocaleString()} articles `;
    },
  },
});
