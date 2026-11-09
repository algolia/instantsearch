/* eslint-disable no-console */
import assert from 'assert';

import * as instantsearchModule from 'instantsearch.js';

const {
  instantsearch,
  version,
  searchBox,
  connectSearchBox,
  historyRouter,
  highlight,
} = instantsearchModule;

assert.ok(instantsearch);
assert.ok(version);
assert.ok(searchBox);
assert.ok(connectSearchBox);
assert.ok(historyRouter);
assert.ok(highlight);
assert.ok(!('default' in instantsearchModule), 'has no default export');

await assert.rejects(() => import('instantsearch.js/es/widgets/index.js'), {
  code: 'ERR_PACKAGE_PATH_NOT_EXPORTED',
});

console.log('instantsearch.js is valid ESM');
