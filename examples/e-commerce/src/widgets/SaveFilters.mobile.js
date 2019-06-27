import { stats } from 'instantsearch.js/es/widgets';

const saveFilters = stats({
  container: '[data-widget="save-filters-mobile"]',
  templates: {
    text: `
<button class="button button-primary">
  See {{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results
</button>
`,
  },
});

export default saveFilters;
