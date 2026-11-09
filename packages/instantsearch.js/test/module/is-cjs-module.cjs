/* eslint-disable no-console */
const assert = require('assert');

const instantsearchModule = require('instantsearch.js');

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

assert.throws(() => require('instantsearch.js/cjs/widgets/index.js'), {
  code: 'ERR_PACKAGE_PATH_NOT_EXPORTED',
});

console.log('instantsearch.js is valid CJS');
