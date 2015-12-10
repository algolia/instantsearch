'use strict';

var zuulConfig = module.exports = {
  ui: 'tape',
  browserify: [{
    transform: 'bulkify'
  }, {
    transform: 'envify'
  }],
  html: './test/ie8-polyfill.html',
  scripts: [
    // browser integration tests will use the dist file, so that we test the
    // build process also
    '/dist/algoliasearch.helper.min.js'
  ],

  // only used when run with saucelabs
  // not activated when dev or phantom
  concurrency: 5,

  // if browser does not sends output in 120s since last output:
  // stop testing, something is wrong
  browser_output_timeout: 60 * 2 * 1000,
  // if browser does not starts after 4 minutes, give up
  browser_open_timeout: 60 * 4 * 1000,

  // we want to be notified something is wrong asap, so no retry
  browser_retries: 0
};

if (process.env.TRAVIS_BUILD_NUMBER !== undefined) {
  zuulConfig.tunnel = 'ngrok';
}

var browsers = require('browzers');

zuulConfig.browsers = process.env.TRAVIS_PULL_REQUEST && process.env.TRAVIS_PULL_REQUEST !== 'false' ?
  browsers.pullRequest :
  browsers.all;
