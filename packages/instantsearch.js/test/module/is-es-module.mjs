/* eslint-disable no-console */
import assert from 'assert';

import instantsearch from 'instantsearch.js/es/index.js';
import * as connectors from 'instantsearch.js/es/connectors/index.js';
import * as helpers from 'instantsearch.js/es/helpers/index.js';
import * as middlewares from 'instantsearch.js/es/middlewares/index.js';
import * as widgets from 'instantsearch.js/es/widgets/index.js';

assert.ok(instantsearch);
assert.ok(connectors);
assert.ok(helpers);
assert.ok(middlewares);
assert.ok(widgets);

console.log('instantsearch.js is valid ESM');
