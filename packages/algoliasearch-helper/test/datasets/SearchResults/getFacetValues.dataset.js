'use strict';

if (require.main === module) {
  /*
   * This file generates the tests files so that the tests can be repeated offline.
   * To regenerate the files, just run it again.
   */

  var path = require('path');

  var replayTools = require('../../replayTools');
  var Helper = require('../../../src/algoliasearch.helper');
  var HelperSaver = replayTools.toSaver(
    Helper,
    path.join(__dirname.replace('datasets', 'spec'), 'getFacetValues')
  );
  var algoliasearch = require('algoliasearch');
  algoliasearch = algoliasearch.algoliasearch || algoliasearch;

  var client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
  var helper = new HelperSaver(client, 'instant_search', {
    disjunctiveFacets: ['brand'],
    maxValuesPerFacet: 3,
  });

  var initialState = helper.state;

  helper
    .searchOnce()
    .then(function () {
      helper.__saveLastToFile('noFilters.json');

      var otherState = initialState.addDisjunctiveFacetRefinement(
        'brand',
        'Apple'
      );
      return helper.searchOnce(otherState);
    })
    .then(function () {
      helper.__saveLastToFile('disjunctive.json');
    })
    .then(
      function () {
        console.log('Dataset sucessfully generated');
      },
      function (e) {
        console.error(e);
      }
    );
}
