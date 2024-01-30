import instantsearch from 'instantsearch.js';

// In real life this would come from an @algolia/client package
import { algolia } from './algolia';

const client = algolia('XX85YRZZMV', '098f71f9e2267178bdfc08cc986d2999');

export const search = instantsearch({
  indexName: 'test_FLAGSHIP_ECOM_recommend',
  client,
  insights: true,
});
