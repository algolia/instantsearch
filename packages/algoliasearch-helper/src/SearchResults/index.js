var forEach = require( "lodash/collection/forEach" );

/**
 * Returns a SearchResults from an Algolia search response.
 * @param {SearchParameters} state state that led to the response
 * @param {object} algoliaResponse the response from algolia client
 **/
var SearchResults = function( state, algoliaResponse ) {
  var mainSubResponse = algoliaResponse.results[ 0 ];

  this.hits = mainSubResponse.hits;
  this.index = mainSubResponse.index;
  this.hitsPerPage = mainSubResponse.hitsPerPage;
  this.nbHits = mainSubResponse.nbHits;
  this.nbPages = mainSubResponse.nbPages;
  this.page = mainSubResponse.page;
  this.params = mainSubResponse.params;
  this.processingTimeMS = mainSubResponse.processingTimeMS;
  this.query = mainSubResponse.query;

  this.disjunctiveFacets = {};
  this.facets = {};
  this.facets_stats = {};

  var disjunctiveFacets = state.getRefinedDisjunctiveFacets();

  //var aggregatedAnswer = content.results[0];

  //Since we send request only for disjunctive facets that have been refined,
  //we get the facets informations from the first, general, response.
  forEach( mainSubResponse.facets, function( facetValueObject, facetKey ) {
    if( state.disjunctiveFacets.indexOf( facetKey ) !== -1 ) {
      this.disjunctiveFacets[ facetKey ] = facetValueObject;
    }
    else {
      this.facets[ facetKey ] = facetValueObject;
    }
  }, this );

  // aggregate the disjunctive facets
  forEach( disjunctiveFacets, function( disjunctiveFacet, idx ) {
    for ( var dfacet in algoliaResponse.results[idx + 1].facets ) {
      if( state.getRankingInfo ) {
        this.facets_stats[dfacet] = mainSubResponse.facets_stats[dfacet] || {};
        this.facets_stats[dfacet].timeout = !!( algoliaResponse.results[idx + 1].timeoutCounts );
      }
      this.disjunctiveFacets[dfacet] = algoliaResponse.results[idx + 1].facets[dfacet];
      if ( state.disjunctiveFacetsRefinements[dfacet] ) {
        forEach( state.disjunctiveFacetsRefinements[ dfacet ], function( refinementValue ){
          // add the disjunctive refinements if it is no more retrieved
          if ( !this.disjunctiveFacets[dfacet][refinementValue] &&
               state.disjunctiveFacetsRefinements[dfacet].indexOf(refinementValue) > -1 ) {
            this.disjunctiveFacets[dfacet][refinementValue] = 0;
          }
        }, this );
      }
    }

    // aggregate the disjunctive facets stats
    for ( var stats in algoliaResponse.results[idx + 1].facets_stats ) {
      this.facets_stats[stats] = algoliaResponse.results[idx + 1].facets_stats[stats];
    }
  }, this );

  // add the excludes
  forEach( state.facetsExcludes, function( excludes, facetName ) {
    this.facets[ facetName ] = mainSubResponse.facets[ facetName ] || {};
    forEach( excludes, function( facetValue ) {
      if ( !mainSubResponse.facets[ facetName ] ) {
        this.facets[ facetName ] = {};
        this.facets[ facetName ][ facetValue ] = 0;
      }
      else if ( !mainSubResponse.facets[ facetName ][ facetValue ] ) {
        this.facets[ facetName ][ facetValue ] = 0;
      }
    }, this );
  }, this );
};

module.exports = SearchResults;
