/* eslint-disable import/no-commonjs */

module.exports = {
  build: {
    // I would really like: nodeExternals({whitelist: [...]})
    transpile: ['vue-instantsearch', 'instantsearch.js/es'],
  },
};
