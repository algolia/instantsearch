import { searchBox as searchBoxWidget } from 'instantsearch.js/es/widgets';

export const searchBox = searchBoxWidget({
  container: '[data-widget="searchbox"]',
  placeholder: 'Product, brand, color, …',
  templates: {
    submit: `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18">
  <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.67" transform="translate(1 1)">
    <circle cx="7.11" cy="7.11" r="7.11"/>
    <path d="M16 16l-3.87-3.87"/>
  </g>
</svg>
    `,
  },
});
