import instantsearch from 'instantsearch.js';

// Stats template data still has `hasNoResults` in v5.
const template = (data) => data.hasNoResults;
