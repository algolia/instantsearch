'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setupSimple;

var algoliasearchHelper = require('../../');

var random = require('lodash/random');


var indexName = '_circle-algoliasearch-helper-js-' +
  (process.env.CIRCLE_BUILD_NUM || 'DEV') +
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
      helper.on('result', function(event) {
        expect(event.results.queryID).toEqual(expect.any(String));
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
      helper.on('result', function(event) {
        expect(event.results.queryID).toBeUndefined();
        done();
      });

      helper.search();
    });
  }
);
