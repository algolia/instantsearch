'use strict';

var algoliasearch = require('algoliasearch');

function setup(indexName, fn) {
  var appID = process.env.INTEGRATION_TEST_APPID;
  var key = process.env.INTEGRATION_TEST_API_KEY;

  var client = algoliasearch(appID, key, {protocol: 'https:'});

  return client.deleteIndex(indexName)
    .then(function() {
      var index = client.initIndex(indexName);

      return fn(client, index);
    });
}

module.exports = {
  setup: setup
};
