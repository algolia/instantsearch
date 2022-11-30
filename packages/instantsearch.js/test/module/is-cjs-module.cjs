/* eslint-disable import/no-commonjs, no-console */
const assert = require('assert');

const instantsearch = require('instantsearch.js/cjs/index.js');
const connectors = require('instantsearch.js/cjs/connectors/index.js');
const helpers = require('instantsearch.js/cjs/helpers/index.js');
const middlewares = require('instantsearch.js/cjs/middlewares/index.js');
const widgets = require('instantsearch.js/cjs/widgets/index.js');

assert.ok(instantsearch);
assert.ok(connectors);
assert.ok(helpers);
assert.ok(middlewares);
assert.ok(widgets);

console.log('instantsearch.js is valid CJS');
