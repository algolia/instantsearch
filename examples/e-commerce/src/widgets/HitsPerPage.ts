import { hitsPerPage as hitsPerPageWidget } from 'instantsearch.js/es/widgets';

export const hitsPerPage = hitsPerPageWidget({
  container: '[data-widget="hits-per-page"]',
  items: [
    {
      label: '16 hits per page',
      value: 16,
      default: true,
    },
    {
      label: '32 hits per page',
      value: 32,
    },
    {
      label: '64 hits per page',
      value: 64,
    },
  ],
});
