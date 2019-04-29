'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setupSimple;

var algoliasearchHelper = utils.isCIBrowser ? window.algoliasearchHelper : require('../../');

var random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}

var indexName = '_travis-algoliasearch-helper-js-' +
  (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
  'helper_searchonce' + random(0, 5000);

var dataset = [
  {objectID: '1', name: 'TestName'}
];

var config = {};

test(
  '[INT][INSIGHTS] search with clickAnalytics should have a queryID',
  function(done) {
    setup(indexName, dataset, config).
    then(function(client) {
      var helper = algoliasearchHelper(client, indexName, {clickAnalytics: true});
      helper.on('result', function(content) {
        expect(typeof content.queryID).toBe('string');
        done();
      });

      helper.search();
    });
  }
);

test(
  '[INT][INSIGHTS] search without clickAnalytics should not have a queryID',
  function(done) {
    setup(indexName, dataset, config).
    then(function(client) {
      var helper = algoliasearchHelper(client, indexName, {});
      helper.on('result', function(content) {
        expect(content.queryID).toBe(undefined);
        done();
      });

      helper.search();
    });
  }
);
