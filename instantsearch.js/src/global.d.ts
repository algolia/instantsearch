import { liteClient } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js/dist/instantsearch.production.min';

declare global {
  interface Window {
    'algoliasearch/lite': {
      liteClient: typeof liteClient;
    };
    instantsearch: typeof instantsearch;
  }
}
