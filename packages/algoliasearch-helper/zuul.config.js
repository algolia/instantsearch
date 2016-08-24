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
  concurrency: 1,

  // if browser does not sends output in 120s since last output:
  // stop testing, something is wrong
  browser_output_timeout: 60 * 3 * 1000,
  // if browser does not starts after 4 minutes, give up
  browser_open_timeout: 60 * 5 * 1000,

  // we want to be notified something is wrong asap, so no retry
  browser_retries: 2
};

if (process.env.TRAVIS_BUILD_NUMBER !== undefined) {
  zuulConfig.tunnel = {
    type: 'ngrok',
    bind_tls: true
  };
}

var browsers = {
  all: [
    {name: 'chrome', version: 'latest', platform: 'Windows 10'},
    {name: 'firefox', version: 'latest', platform: 'Windows 10'},
    {name: 'internet explorer', version: '9..11'},
    {name: 'safari', version: 'latest'},
    {name: 'iphone', version: 'latest'},
    {name: 'android', version: 'latest'},
    {name: 'ipad', version: 'latest'},
    {name: 'microsoftedge', version: 'latest'}
  ],
  pullRequest: [
    {name: 'chrome', version: 'latest', platform: 'Windows 10'},
    {name: 'internet explorer', version: ['9', '11']},
    {name: 'firefox', version: 'latest', platform: 'Windows 10'},
    {name: 'iphone', version: '9.0'},
    {name: 'android', version: 'latest'},
    {name: 'microsoftedge', version: 'latest'}
  ]
};

zuulConfig.browsers = process.env.TRAVIS_PULL_REQUEST && process.env.TRAVIS_PULL_REQUEST !== 'false' ?
  browsers.pullRequest :
    browsers.all;
