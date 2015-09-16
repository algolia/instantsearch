'use strict';

var zuulConfig = module.exports = {
  ui: 'tape',
  browserify: [{
    transform: 'bulkify'
  }, {
    transform: 'envify'
  }],
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

  // we want to be notified something is wrong asap, so no retry
  browser_retries: 0
};

if (process.env.TRAVIS_BUILD_NUMBER !== undefined) {
  zuulConfig.tunnel = 'ngrok';
}

var browsers = {
  all: [{
    name: 'chrome',
    version: '-2..latest',
    platform: 'Windows 10'
  }, {
    name: 'firefox',
    version: '-2..latest',
    platform: 'Windows 10'
  }, {
    name: 'ie',
    version: '8..latest'
  }, {
    name: 'safari',
    version: '6..latest'
  }, {
    name: 'iphone',
    version: '7.0..latest'
  }, {
    name: 'android',
    version: '4.1..latest'
  }, {
    name: 'ipad',
    version: '7.0..latest'
  }],
  pullRequest: [{
    name: 'chrome',
    version: 'latest', // `latest` === stable
    platform: 'Windows 10'
  }, {
    name: 'firefox',
    version: 'latest',
    platform: 'Windows 10'
  }, {
    name: 'ie',
    version: 'latest'
  }, {
    name: 'iphone',
    version: 'latest'
  }, {
    name: 'android',
    version: 'latest'
  }]
};

zuulConfig.browsers = process.env.TRAVIS_PULL_REQUEST && process.env.TRAVIS_PULL_REQUEST !== 'false' ?
  browsers.pullRequest :
  browsers.all;
