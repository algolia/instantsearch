'use strict';

var algoliasearch = require('algoliasearch');

function setup(indexName, fn) {
  var appID = process.env.INTEGRATION_TEST_APPID;
  var key = process.env.INTEGRATION_TEST_API_KEY;

  var client = algoliasearch(appID, key, {
    // all indexing requests must be done in https
    protocol: 'https:'
  });
  var index = client.initIndex(indexName);

  return index
    .clearIndex()
    .then(function(content) {
      return index.waitTask(content.taskID);
    })
    .then(function() {
      return fn(client, index);
    });
}

function withDatasetAndConfig(indexName, dataset, config) {
  return setup(indexName, function(client, index) {
    return index.addObjects(dataset).then(function() {
      return index.setSettings(config);
    }).then(function(content) {
      return index.waitTask(content.taskID);
    }).then(function() {
      return client;
    });
  });
}

// some environements are not able to do indexing requests using
// PUT, like IE8 and IE9
var shouldRun;

if (!process.browser) {
  shouldRun = true;
} else if ('XDomainRequest' in window) {
  shouldRun = false;
} else {
  shouldRun = true;
}

module.exports = {
  isCIBrowser: process.browser && process.env.TRAVIS_BUILD_NUMBER,
  setup: setup,
  setupSimple: withDatasetAndConfig,
  shouldRun: shouldRun
};
