/* eslint-disable import/no-commonjs */
const define = require('jscodeshift/dist/testUtils').defineTest;

// define(__dirname, 'src/rish-to-ris', null, 'rish-to-ris/import');
// define(__dirname, 'src/rish-to-ris', null, 'rish-to-ris/path');
define(__dirname, 'src/rish-to-ris', null, 'rish-to-ris/use');
