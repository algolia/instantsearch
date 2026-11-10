import instantsearch from 'instantsearch.js';

instantsearch.highlight({ attribute: 'name', hit });
instantsearch.snippet({ attribute: 'name', hit });
instantsearch.createInfiniteHitsSessionStorageCache();
instantsearch.insights('init', {});
