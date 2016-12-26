'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setupSimple;

var algoliasearchHelper = utils.isCIBrowser ? window.algoliasearchHelper : require('../../');

var test = require('tape');
var random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}
var indexName = '_travis-algoliasearch-helper-js-' +
  (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
  'helper_searchonce' + random(0, 5000);

var dataset = [
  {objectID: '1', _geoloc: {lat: 1, lng: 1}},
  {objectID: '2', _geoloc: {lat: 1, lng: 2}},
  {objectID: '3', _geoloc: {lat: 2, lng: 1}},
  {objectID: '4', _geoloc: {lat: 2, lng: 2}}
];

var config = {};

test(
  '[INT][GEO-SEARCH] search inside a single polygon with a string',
  function(t) {
    setup(indexName, dataset, config).
    then(function(client) {
      var helper = algoliasearchHelper(client, indexName, {});
      helper.on('result', function(content) {
        t.equal(content.hits.length, 1);
        t.equal(content.hits[0].objectID, '1');
        t.end();
      });

      helper.setQueryParameter('insidePolygon', '0,0,1.1,0,1.1,1.1,0,1.1').search();
    });
  }
);

test(
  '[INT][GEO-SEARCH] search inside a single polygon with an array',
  function(t) {
    setup(indexName, dataset, config).
    then(function(client) {
      var helper = algoliasearchHelper(client, indexName, {});
      helper.on('result', function(content) {
        t.equal(content.hits.length, 1);
        t.equal(content.hits[0].objectID, '1');
        t.end();
      });

      helper.setQueryParameter('insidePolygon', [[0, 0, 1.1, 0, 1.1, 1.1, 0, 1.1]]).search();
    });
  }
);

test(
  '[INT][GEO-SEARCH] search inside two polygons with an array',
  function(t) {
    setup(indexName, dataset, config).
    then(function(client) {
      var helper = algoliasearchHelper(client, indexName, {});

      helper.on('result', function(content) {
        t.equal(content.hits.length, 2);
        var sortedHits = content.hits.sort(function(a, b) { return a.objectID.localeCompare(b.objectID); });
        t.equal(sortedHits[0].objectID, '1');
        t.equal(sortedHits[1].objectID, '4');
        t.end();
      });

      helper.setQueryParameter(
        'insidePolygon',
        [[0, 0, 1.1, 0, 1.1, 1.1, 0, 1.1], [1.5, 1.5, 2.1, 1.5, 2.1, 2.1, 1.5, 2.1]]).search();
    });
  }
);
