import instantsearch from 'instantsearch.js';

import { highlight, snippet } from 'instantsearch.js/es/helpers';
import { createInfiniteHitsSessionStorageCache } from 'instantsearch-core';

highlight({ attribute: 'name', hit });
snippet({ attribute: 'name', hit });
createInfiniteHitsSessionStorageCache();
// TODO(instantsearch v5): `instantsearch.insights` is removed, use `createInsightsMiddleware` and `instantSearchInstance.use(...)`.
instantsearch.insights('init', {});
// TODO(instantsearch v5): `getInsightsAnonymousUserToken` is removed. What to do depends on what you did with the token:
// - to get the token onto your searches: delete the call, `createInsightsMiddleware` already sends it as the `userToken` search parameter;
// - to use the value in your own code (send it to your API, log it, etc.): read it from the insights client, which now owns it: `aa("getUserToken", null, (err, userToken) => { ... })`;
// - to get it on the server (SSR), where there is no insights client: read the `_ALGOLIA` cookie (insights only writes it when initialized with `useCookie: true`) and pass it as `userToken` yourself.
instantsearch.getInsightsAnonymousUserToken();
