import instantsearch from 'instantsearch.js/dist/instantsearch.production.min';

declare global {
  interface Window {
    instantsearch: typeof instantsearch;
  }
}
