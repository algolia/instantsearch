/* eslint-disable no-console */
const assert = require('assert');

const connectors = require('instantsearch.js/cjs/connectors/index.js');
const helpers = require('instantsearch.js/cjs/helpers/index.js');
const instantsearch = require('instantsearch.js/cjs/index.js');
const widgets = require('instantsearch.js/cjs/widgets/index.js');

assert.ok(instantsearch);
assert.ok(connectors);
assert.ok(helpers);
assert.ok(widgets);

console.log('instantsearch.js is valid CJS');
