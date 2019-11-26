// eslint-disable-next-line import/no-unresolved,import/extensions
import instantsearch from 'instantsearch.js';

const search = instantsearch();

search.addWidget(instantsearch.widgets.hits({}));
search.addWidget(instantsearch.widgets.hits({}));
