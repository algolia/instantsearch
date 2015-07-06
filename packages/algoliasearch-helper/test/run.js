'use strict';

require('bulk-require')(__dirname, ['spec/**/*.js']);

if (process.env.INTEGRATION_TEST_API_KEY && process.env.INTEGRATION_TEST_APPID) {
  // usage: INTEGRATION_TEST_APPID=$APPID INTEGRATION_TEST_API_KEY=$APIKEY npm run dev
  require('bulk-require')(__dirname, ['integration-spec/**/*.js']);
}
