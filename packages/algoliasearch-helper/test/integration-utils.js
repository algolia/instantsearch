'use strict';

var algoliasearch = require('algoliasearch');

function setup(indexName, fn) {
  var appID = process.env.INTEGRATION_TEST_APPID;
  var key = process.env.INTEGRATION_TEST_API_KEY;

  if (!appID) {
    throw new Error('Missing environment variable INTEGRATION_TEST_APPID');
  }
  if (!key) {
    throw new Error('Missing environment variable INTEGRATION_TEST_API_KEY');
  }

  var client = algoliasearch(appID, key, {
    // all indexing requests must be done in https
    protocol: 'https:',
  });
  client.deleteIndex =
    client.deleteIndex ||
    function (deleteIndexName) {
      return client.initIndex(deleteIndexName).delete();
    };
  client.listIndexes = client.listIndexes || client.listIndices;

  var index = client.initIndex(indexName);
  index.addObjects =
    index.addObjects ||
    function (objects) {
      return index
        .saveObjects(objects, { autoGenerateObjectIDIfNotExist: true })
        .then(function (content) {
          return {
            taskID: content.taskIDs[0],
          };
        });
    };
  index.clearIndex = index.clearIndex || index.clearObjects;

  return index
    .clearIndex()
    .then(function (content) {
      return index.waitTask(content.taskID);
    })
    .then(function () {
      return fn(client, index);
    });
}

function withDatasetAndConfig(indexName, dataset, config) {
  return setup(indexName, function (client, index) {
    return index
      .addObjects(dataset)
      .then(function () {
        return index.setSettings(config);
      })
      .then(function (content) {
        return index.waitTask(content.taskID);
      })
      .then(function () {
        return client;
      });
  });
}

function createIndexName(name) {
  return (
    '_circle-algoliasearch-helper-js-' +
    (process.env.CIRCLE_BUILD_NUM || 'DEV') +
    name +
    Math.round(Math.random() * 5000)
  );
}

module.exports = {
  setupSimple: withDatasetAndConfig,
  createIndexName: createIndexName,
};
