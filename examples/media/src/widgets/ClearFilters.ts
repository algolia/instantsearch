import { clearRefinements } from 'instantsearch.js/es/widgets';

export const clearFilters = clearRefinements({
  container: '[data-widget="clear-filters"]',
  excludedAttributes: ['topics', 'query'],
  templates: {
    resetLabel: `
<div class="clear-filters">
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14">
    <g fill="none" fill-rule="evenodd" stroke="#6E7070" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <path d="M1 1.65v3.9h3.9"/>
      <path d="M2.631 8.8a5.85 5.85 0 1 0 1.385-6.084L1 5.55"/>
    </g>
  </svg>

  Clear filters
</div>
`,
  },
});
