import {
  pagination as paginationWidget,
  panel,
} from 'instantsearch.js/es/widgets';

const paginationWithMultiplePages = panel({
  hidden({ results }) {
    return results.nbPages <= 1;
  },
})(paginationWidget);

export const pagination = paginationWithMultiplePages({
  container: '[data-widget="pagination"]',
  scrollTo: '.container',
  padding: 2,
  showFirst: false,
  showLast: false,
  templates: {
    previous: `
<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
  <g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.143">
    <path d="M9 5H1M5 9L1 5l4-4"/>
  </g>
</svg>
    `,
    next: `
<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
  <g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.143">
    <path d="M1 5h8M5 9l4-4-4-4"/>
  </g>
</svg>
    `,
  },
});
