/* eslint-disable import/no-commonjs */
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'ris-v6-to-v7', null, 'ris-v6-to-v7/app-inline');
defineTest(
  __dirname,
  'ris-v6-to-v7',
  null,
  'ris-v6-to-v7/translations-not-inline'
);
defineTest(
  __dirname,
  'ris-v6-to-v7',
  null,
  'ris-v6-to-v7/translations-functions-lambda'
);
defineTest(
  __dirname,
  'ris-v6-to-v7',
  null,
  'ris-v6-to-v7/translations-functions-declaration'
);
defineTest(
  __dirname,
  'ris-v6-to-v7',
  null,
  'ris-v6-to-v7/translations-functions-no-param'
);
defineTest(
  __dirname,
  'ris-v6-to-v7',
  null,
  'ris-v6-to-v7/translations-functions-not-inline'
);
defineTest(
  __dirname,
  'ris-v6-to-v7',
  null,
  'ris-v6-to-v7/placeholder-not-inline'
);
defineTest(__dirname, 'ris-v6-to-v7', null, 'ris-v6-to-v7/import-path');
defineTest(__dirname, 'ris-v6-to-v7', null, 'ris-v6-to-v7/menuselect');
defineTest(__dirname, 'ris-v6-to-v7', null, 'ris-v6-to-v7/connectors');
defineTest(__dirname, 'ris-v6-to-v7', null, 'ris-v6-to-v7/searchbox-icons');
