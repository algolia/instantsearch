/* eslint-disable import/no-commonjs */
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(
  __dirname,
  'src/addWidget-to-addWidgets',
  null,
  'addWidget-to-addWidgets/global'
);

defineTest(
  __dirname,
  'src/addWidget-to-addWidgets',
  null,
  'addWidget-to-addWidgets/imported'
);

defineTest(
  __dirname,
  'src/addWidget-to-addWidgets',
  null,
  'addWidget-to-addWidgets/mixed'
);

defineTest(
  __dirname,
  'src/addWidget-to-addWidgets',
  null,
  'addWidget-to-addWidgets/remove'
);
