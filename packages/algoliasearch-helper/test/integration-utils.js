'use strict';

var algoliasearch = require('algoliasearch');

function setup(indexName, fn) {
  var appID = process.env.INTEGRATION_TEST_APPID;
  var key = process.env.INTEGRATION_TEST_API_KEY;

  var client = algoliasearch(appID, key, {protocol: 'https:'});
  var index = client.initIndex(indexName);

  return client
    .deleteIndex(indexName)
    .then(function(content) {
      return index.waitTask(content.taskID);
    })
    .then(function() {
      return fn(client, index);
    });
}

module.exports = {
  setup: setup
};
