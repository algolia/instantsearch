/* eslint-disable import/no-commonjs */
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'rish-to-ris', null, 'rish-to-ris/import');
defineTest(__dirname, 'rish-to-ris', null, 'rish-to-ris/path');
