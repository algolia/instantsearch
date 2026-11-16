/* eslint-disable import/no-commonjs */
const define = require('jscodeshift/dist/testUtils').defineTest;

define(__dirname, 'src/is-v4-to-v5', null, 'is-v4-to-v5/renames');
define(__dirname, 'src/is-v4-to-v5', null, 'is-v4-to-v5/helpers');
define(__dirname, 'src/is-v4-to-v5', null, 'is-v4-to-v5/stats');
define(__dirname, 'src/is-v4-to-v5', null, 'is-v4-to-v5/routing');
define(__dirname, 'src/is-v4-to-v5', null, 'is-v4-to-v5/todos', {
  parser: 'tsx',
});
define(__dirname, 'src/is-v4-to-v5', null, 'is-v4-to-v5/vue-autocomplete');
define(__dirname, 'src/is-v4-to-v5', null, 'is-v4-to-v5/vue-autocomplete-old');
define(__dirname, 'src/is-v4-to-v5', null, 'is-v4-to-v5/vue-autocomplete-both');
