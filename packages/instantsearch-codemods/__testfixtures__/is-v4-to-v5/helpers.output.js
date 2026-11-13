import instantsearch from 'instantsearch.js';

import { highlight, snippet } from 'instantsearch.js/es/helpers';
import { createInfiniteHitsSessionStorageCache } from 'instantsearch-core';

highlight({ attribute: 'name', hit });
snippet({ attribute: 'name', hit });
createInfiniteHitsSessionStorageCache();
// TODO(instantsearch v5): `instantsearch.insights` is removed, use `createInsightsMiddleware` and `instantSearchInstance.use(...)`.
instantsearch.insights('init', {});
// TODO(instantsearch v5): `instantsearch.getInsightsAnonymousUserToken` is removed, the `insights` middleware sets the anonymous user token. To read it, use `aa('getUserToken', null, (error, userToken) => {})` from `search-insights`.
const userToken = instantsearch.getInsightsAnonymousUserToken();
