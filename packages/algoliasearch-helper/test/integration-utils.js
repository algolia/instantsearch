'use strict';

var algoliasearch = require('algoliasearch');
algoliasearch = algoliasearch.algoliasearch || algoliasearch;

function setup(indexName, fn) {
  var appID = process.env.INTEGRATION_TEST_APPID;
  var key = process.env.INTEGRATION_TEST_API_KEY;

  var client = algoliasearch(appID, key, {
    // all indexing requests must be done in https
    protocol: 'https:',
  });
  var hasInitIndex = Boolean(client.initIndex);
  var originalDeleteIndex = client.deleteIndex
    ? client.deleteIndex.bind(client)
    : undefined;

  client.deleteIndex = function (deleteIndexName) {
    if (!originalDeleteIndex) {
      return client.initIndex(deleteIndexName).delete();
    }
    if (!hasInitIndex) {
      return originalDeleteIndex({ indexName: deleteIndexName });
    }
    return originalDeleteIndex(deleteIndexName);
  };
  client.listIndexes = client.listIndexes || client.listIndices;
  client.initIndex =
    client.initIndex ||
    function (initIndexName) {
      return {
        addObjects: function (objects) {
          return client.saveObjects({
            objects: objects,
            indexName: initIndexName,
          });
        },
        clearObjects: function () {
          return client.clearObjects({ indexName: initIndexName });
        },
        setSettings: function (settings) {
          return client.setSettings({
            indexName: initIndexName,
            indexSettings: settings,
          });
        },
        waitTask: function (taskID) {
          return client.waitForTask({
            indexName,
            initIndexName,
            taskID: taskID,
          });
        },
      };
    };
  client.destroy = client.destroy || function () {};

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

  // Ensure we go into the right integration branches (and client stays v5)
  client.initIndex = hasInitIndex ? client.initIndex : undefined;

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
