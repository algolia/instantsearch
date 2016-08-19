'use strict';

var bulk = require('bulk-require');

bulk(__dirname, ['spec/**/*.js']);

if (process.env.INTEGRATION_TEST_API_KEY && process.env.INTEGRATION_TEST_APPID) {
  // usage: INTEGRATION_TEST_APPID=$APPID INTEGRATION_TEST_API_KEY=$APIKEY npm run dev
  bulk(__dirname, ['integration-spec/**/*.js']);
}
