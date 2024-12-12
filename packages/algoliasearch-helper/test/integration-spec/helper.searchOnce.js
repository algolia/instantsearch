'use strict';

var algoliasearchHelper = require('../../');
var utils = require('../integration-utils');
var setup = utils.setupSimple;
var createIndexName = utils.createIndexName;

var indexName = createIndexName('helper_searchonce');

var dataset = [
  { objectID: '1', facet: ['f1', 'f2'] },
  { objectID: '2', facet: ['f1', 'f3'] },
  { objectID: '3', facet: ['f2', 'f3'] },
];

var config = {
  attributesToIndex: ['facet'],
  attributesForFaceting: ['facet'],
};

var client;
beforeAll(function () {
  return setup(indexName, dataset, config).then(function (c) {
    client = c;
  });
});

test('[INT][SEARCHONCE] Should be able to search once with custom parameters without changing main search state', function (done) {
  var helper = algoliasearchHelper(client, indexName);
  var state0 = helper.state;

  var calls = 1;
  helper.on('error', function (error) {
    done(error);
  });

  helper.on('result', function (event) {
    if (calls === 3) {
      expect(event.results.hits.length).toBe(3);
      done();
    } else {
      done(
        new Error('Should not trigger the result event until the third call')
      );
    }
  });

  var state1 = state0.setFacets(['facet']).addFacetRefinement('facet', 'f1');
  helper.searchOnce(state1).then(function (res) {
    expect(helper.state).toBe(state0);
    expect(res.state).toEqual(state1);
    expect(res.content.hits.length).toBe(2);
    expect(
      res.content.hits.find(function (hit) {
        return hit.objectID === '2';
      })
    ).toBeTruthy();
    expect(
      res.content.hits.find(function (hit) {
        return hit.objectID === '1';
      })
    ).toBeTruthy();
    calls++;
    var state2 = state0.setFacets(['facet']).addFacetRefinement('facet', 'f2');
    helper.searchOnce(state2, function (err, c, s) {
      expect(err).toBe(null);
      expect(helper.state).toBe(state0);
      expect(s).toEqual(state2);
      expect(c.hits.length).toBe(2);
      expect(
        c.hits.find(function (hit) {
          return hit.objectID === '1';
        })
      ).toBeTruthy();
      expect(
        c.hits.find(function (hit) {
          return hit.objectID === '3';
        })
      ).toBeTruthy();
      calls++;
      helper.search();
    });
  });
});
