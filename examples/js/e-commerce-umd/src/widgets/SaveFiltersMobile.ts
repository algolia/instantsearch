const { stats } = window.instantsearch.widgets;

export const saveFiltersMobile = stats({
  container: '[data-widget="save-filters-mobile"]',
  templates: {
    text: `
<button class="button button-primary">
  See {{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results
</button>
`,
  },
});
