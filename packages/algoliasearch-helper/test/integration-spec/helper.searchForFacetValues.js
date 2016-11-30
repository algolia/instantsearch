'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setupSimple;

var algoliasearchHelper = utils.isCIBrowser ? window.algoliasearchHelper : require('../../');

var test = require('tape');
var bind = require('lodash/bind');
var random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}
var indexName = '_travis-algoliasearch-helper-js-' +
  (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
  'helper_searchonce' + random(0, 5000);

var dataset = [
  {objectID: '1', f: 'ba', f2: ['b']},
  {objectID: '2', f: 'ba', f2: ['c', 'x']},
  {objectID: '3', f: 'ba', f2: ['d']},
  {objectID: '4', f: 'bb', f2: ['b']},
  {objectID: '5', f: 'bb', f2: ['c', 'y']}
];

var config = {
  searchableAttributes: ['f', 'f2'],
  attributesForFaceting: ['f', 'f2']
};

test(
  '[INT][SEARCHFORCETVALUES] Should be able to search for facet values - conjunctive',
  function(t) {
    setup(indexName, dataset, config).
    then(function(client) {
      var helper = algoliasearchHelper(client, indexName, {
        facets: ['f', 'f2']
      });

      helper.searchForFacetValues('f', 'a').then(function(content) {
        t.ok(content, 'should get some content');
        t.equal(content.facetHits.length, 0, 'should get 0 results');

        return helper.searchForFacetValues('f', 'b');
      }).then(function(content) {
        t.ok(content, 'should get some content');

        t.deepEqual(content.facetHits, [
          {value: 'ba', highlighted: '<em>b</em>a', count: 3, isRefined: false},
          {value: 'bb', highlighted: '<em>b</em>b', count: 2, isRefined: false}
        ]);

        helper.addFacetRefinement('f2', 'c');
        return helper.searchForFacetValues('f', 'b');
      }).then(function(content) {
        t.ok(content, 'should get some content');

        t.deepEqual(content.facetHits, [
          {value: 'ba', highlighted: '<em>b</em>a', count: 1, isRefined: false},
          {value: 'bb', highlighted: '<em>b</em>b', count: 1, isRefined: false}
        ]);

        helper.clearRefinements().addFacetRefinement('f2', 'c');
        return helper.searchForFacetValues('f2', '');
      }).then(function(content) {
        t.ok(content, 'should get some content');

        t.deepEqual(content.facetHits, [
          {value: 'c', highlighted: 'c', count: 2, isRefined: true},
          {value: 'x', highlighted: 'x', count: 1, isRefined: false},
          {value: 'y', highlighted: 'y', count: 1, isRefined: false}
        ]);

        t.end();
      }).catch(function(err) {
        setTimeout(function() {throw err;}, 1);
      });
    }).then(null, bind(t.error, t));
  });

test(
  '[INT][SEARCHFORCETVALUES] Should be able to search for facet values - disjunctive',
  function(t) {
    setup(indexName, dataset, config).
    then(function(client) {
      var helper = algoliasearchHelper(client, indexName, {
        disjunctiveFacets: ['f', 'f2']
      });

      helper.searchForFacetValues('f', 'a').then(function(content) {
        t.ok(content, 'should get some content');
        t.equal(content.facetHits.length, 0, 'should get 0 results');

        return helper.searchForFacetValues('f', 'b');
      }).then(function(content) {
        t.ok(content, 'should get some content');

        t.deepEqual(content.facetHits, [
          {value: 'ba', highlighted: '<em>b</em>a', count: 3, isRefined: false},
          {value: 'bb', highlighted: '<em>b</em>b', count: 2, isRefined: false}
        ]);

        helper.addDisjunctiveFacetRefinement('f2', 'd');
        return helper.searchForFacetValues('f', 'b');
      }).then(function(content) {
        t.ok(content, 'should get some content');

        t.deepEqual(content.facetHits, [
          {value: 'ba', highlighted: '<em>b</em>a', count: 1, isRefined: false}
        ]);

        helper.addDisjunctiveFacetRefinement('f2', 'c');
        return helper.searchForFacetValues('f2', '');
      }).then(function(content) {
        t.ok(content, 'should get some content');

        t.deepEqual(content.facetHits, [
          {value: 'b', highlighted: 'b', count: 2, isRefined: false},
          {value: 'c', highlighted: 'c', count: 1, isRefined: false},
          {value: 'x', highlighted: 'x', count: 1, isRefined: false},
          {value: 'd', highlighted: 'd', count: 1, isRefined: false},
          {value: 'y', highlighted: 'y', count: 1, isRefined: false}
        ]);

        t.end();
      }).catch(function(err) {
        setTimeout(function() {throw err;}, 1);
      });
    }).then(null, bind(t.error, t));
  });

