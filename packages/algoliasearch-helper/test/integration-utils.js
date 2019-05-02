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

module.exports = {
  setup: setup,
  setupSimple: withDatasetAndConfig
};
