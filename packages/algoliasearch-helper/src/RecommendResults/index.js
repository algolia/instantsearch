'use strict';

/**
 * Constructor for SearchResults
 * @class
 * @classdesc SearchResults contains the results of a query to Algolia using the
 * {@link AlgoliaSearchHelper}.
 * @param {RecommendParameters} state state that led to the response
 * @param {array.<object>} results the results from algolia client
 **/
function RecommendResults(state, results) {
  this._state = state;
  this._rawResults = results;

  // eslint-disable-next-line consistent-this
  var self = this;

  results.forEach(function (result, index) {
    if (state.params[index] === undefined) return;

    var id = state.params[index].$$id;
    self[id] = result;
  });
}

RecommendResults.prototype = {
  constructor: RecommendResults,
};

module.exports = RecommendResults;
