// CJS entry point for require('create-instantsearch-app')
// Uses Node 22's require(esm) support, extracting the default export
// so consumers get the factory function directly.
const mod = require('./src/api/index.js');
module.exports = mod.default || mod;
