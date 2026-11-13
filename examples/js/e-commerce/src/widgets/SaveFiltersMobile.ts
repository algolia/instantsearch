import { stats } from 'instantsearch.js';
export const saveFiltersMobile = stats({
  container: '[data-widget="save-filters-mobile"]',
  templates: {
    text({ nbHits }, { html }) {
      return html`
        <button class="button button-primary">
          See ${nbHits.toLocaleString()} results
        </button>
      `;
    },
  },
});
