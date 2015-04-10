"use strict";
var AlgoliaSearchHelper = require( "./src/algoliasearch.helper" );
/**
 * Algolia Search Helper providing faceting and disjunctive faceting
 * @param {AlgoliaSearch} client - An AlgoliaSearch client
 * @param {string} index - The index name to query
 * @param {Object} [opts] an associative array defining the hitsPerPage, list of facets, the list of disjunctive facets and the default facet filters
 */
function helper( client, index, opts ) {
  return new AlgoliaSearchHelper( client, index, opts );
}

helper.version = "2.0.0-beta"

module.exports = helper;
