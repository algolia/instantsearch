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
    path.join(__dirname.replace('datasets', 'spec'), 'getRefinements')
  );
  var algoliasearch = require('algoliasearch');

  var client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
  var helper = new HelperSaver(client, 'instant_search', {
    facets: ['brand'],
    disjunctiveFacets: ['type', 'rating'],
    hierarchicalFacets: [
      {
        name: 'hierarchicalCategories',
        attributes: [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
          'hierarchicalCategories.lvl3',
        ],
      },
    ],
  });

  var initialState = helper.state;

  helper
    .searchOnce()
    .then(function () {
      helper.__saveLastToFile('noFilters.json');

      var otherState = initialState.addFacetRefinement('brand', 'Apple');
      return helper.searchOnce(otherState);
    })
    .then(function () {
      helper.__saveLastToFile('conjunctive-brand-apple.json');

      var otherState = initialState.addDisjunctiveFacetRefinement(
        'type',
        'Trend cases'
      );
      return helper.searchOnce(otherState);
    })
    .then(function () {
      helper.__saveLastToFile('disjunctive-type-trendcase.json');

      var otherState = initialState.addNumericRefinement('rating', '=', 3);
      return helper.searchOnce(otherState);
    })
    .then(function () {
      helper.__saveLastToFile('numeric-rating-3.json');

      var otherState = initialState.toggleHierarchicalFacetRefinement(
        'hierarchicalCategories',
        'Best Buy Gift Cards > Entertainment Gift Cards'
      );
      return helper.searchOnce(otherState);
    })
    .then(function () {
      helper.__saveLastToFile('hierarchical-cards.json');

      var otherState = initialState
        .addTagRefinement('foo')
        .addTagRefinement('bar');
      return helper.searchOnce(otherState);
    })
    .then(function () {
      helper.__saveLastToFile('dummy-tags.json');

      var otherState = initialState.addExcludeRefinement('brand', 'Apple');
      return helper.searchOnce(otherState);
    })
    .then(function () {
      helper.__saveLastToFile('exclude-apple.json');
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
