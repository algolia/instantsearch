'use strict';

var utils = require('../integration-utils');
var setup = utils.setupSimple;
var createIndexName = utils.createIndexName;

var algoliasearchHelper = require('../../');

var indexName = createIndexName('helper_geo');

var dataset = [
  { objectID: '1', _geoloc: { lat: 1, lng: 1 } },
  { objectID: '2', _geoloc: { lat: 1, lng: 2 } },
  { objectID: '3', _geoloc: { lat: 2, lng: 1 } },
  { objectID: '4', _geoloc: { lat: 2, lng: 2 } },
];

var config = {};

var client;
beforeAll(function () {
  return setup(indexName, dataset, config).then(function (c) {
    client = c;
  });
});

test('[INT][GEO-SEARCH] search inside a single polygon with a string', function (done) {
  var helper = algoliasearchHelper(client, indexName, {});
  helper.on('result', function (event) {
    expect(event.results.hits.length).toBe(1);
    expect(event.results.hits[0].objectID).toBe('1');
    done();
  });

  helper.setQueryParameter('insidePolygon', '0,0,1.1,0,1.1,1.1,0,1.1').search();
});

test('[INT][GEO-SEARCH] search inside a single polygon with an array', function (done) {
  var helper = algoliasearchHelper(client, indexName, {});
  helper.on('result', function (event) {
    expect(event.results.hits.length).toBe(1);
    expect(event.results.hits[0].objectID).toBe('1');
    done();
  });

  helper
    .setQueryParameter('insidePolygon', [[0, 0, 1.1, 0, 1.1, 1.1, 0, 1.1]])
    .search();
});

test('[INT][GEO-SEARCH] search inside two polygons with an array', function (done) {
  var helper = algoliasearchHelper(client, indexName, {});

  helper.on('result', function (event) {
    expect(event.results.hits.length).toBe(2);
    var sortedHits = event.results.hits.sort(function (a, b) {
      return a.objectID.localeCompare(b.objectID);
    });
    expect(sortedHits[0].objectID).toBe('1');
    expect(sortedHits[1].objectID).toBe('4');
    done();
  });

  helper
    .setQueryParameter('insidePolygon', [
      [0, 0, 1.1, 0, 1.1, 1.1, 0, 1.1],
      [1.5, 1.5, 2.1, 1.5, 2.1, 2.1, 1.5, 2.1],
    ])
    .search();
});
