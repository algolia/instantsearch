import { stats } from 'instantsearch.js/es/widgets';

const saveFilters = stats({
  container: '[data-widget="save-filters-mobile"]',
  templates: {
    text: `
<button class="button button-primary">
  See {{nbHits}} results
</button>
`,
  },
});

export default saveFilters;
