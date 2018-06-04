/* eslint-disable */

// This file only exist to allow the import from 'react-instantsearch-dom/server'
// We can't have this import working easily with the current project architecture.
// The main reason is that we require to have the files transpiled at development
// time to allow the import accross Workspaces (node_modules are not transpiled).
// To achieve this we scope all the packages artefacts in the `dist` folder under
// `/cjs` & `/es`. At the end we can require the package as it is with a `main`
// that point to `./dist/cjs/index.js` & `module` that point to the `es` folder.
// But the `/server` import will fallback into this file instead of the correct
// one the `dist` folder.

var server = require('./dist/cjs/server');

module.exports = {
  createInstantSearch: server.createInstantSearch,
};
