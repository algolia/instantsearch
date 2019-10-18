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
// We now have the solution for those use cases: private packages. You can have
// nested private packages inside your "main" package. The advantage of this
// approach is to leverage the module resolution of npm. A popular package built
// with this approach is Preact 10.x.x: https://bit.ly/2WrMjLF

var server = require('./dist/cjs/server');

module.exports = server;
