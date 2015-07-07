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
  setup: setup,
  shouldRun: shouldRun
};
