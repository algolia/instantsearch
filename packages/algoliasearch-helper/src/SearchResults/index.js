var forEach = require( "lodash/collection/forEach" );
var compact = require( "lodash/array/compact" );

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

  this.disjunctiveFacets = [];
  this.facets = [];
  this.facets_stats = [];

  var disjunctiveFacets = state.getRefinedDisjunctiveFacets();

  //var aggregatedAnswer = content.results[0];
  var facetsIndices = getIndices( state.facets );
  var disjunctiveFacetsIndices = getIndices( state.disjunctiveFacets );

  //Since we send request only for disjunctive facets that have been refined,
  //we get the facets informations from the first, general, response.
  forEach( mainSubResponse.facets, function( facetValueObject, facetKey ) {
    if( state.disjunctiveFacets.indexOf( facetKey ) !== -1 ) {
      var position = disjunctiveFacetsIndices[ facetKey ];
      this.disjunctiveFacets[ position ] = {
        name : facetKey,
        data : facetValueObject
      };
    }
    else {
      var position = facetsIndices[ facetKey ];
      this.facets[ position ] = {
        name : facetKey,
        data : facetValueObject
      };
    }
  }, this );

  // aggregate the refined disjunctive facets
  forEach( disjunctiveFacets, function( disjunctiveFacet, idx ) {

    for ( var dfacet in algoliaResponse.results[idx + 1].facets ) {
      if( state.getRankingInfo ) {
        this.facets_stats[dfacet] = mainSubResponse.facets_stats[dfacet] || {};
        this.facets_stats[dfacet].timeout = !!( algoliaResponse.results[idx + 1].timeoutCounts );
      }

      var position = disjunctiveFacetsIndices[ dfacet ];

      this.disjunctiveFacets[ position ] = {
        name : dfacet,
        data : algoliaResponse.results[idx + 1].facets[dfacet]
      };
      if ( state.disjunctiveFacetsRefinements[dfacet] ) {
        forEach( state.disjunctiveFacetsRefinements[ dfacet ], function( refinementValue ){
          // add the disjunctive refinements if it is no more retrieved
          if ( !this.disjunctiveFacets[position].data[refinementValue] &&
               state.disjunctiveFacetsRefinements[dfacet].indexOf(refinementValue) > -1 ) {
            this.disjunctiveFacets[position].data[refinementValue] = 0;
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
    var position = facetsIndices[ facetName ];
    this.facets[ position ] = {
      name : facetName,
      data : mainSubResponse.facets[ facetName ]
    };
    forEach( excludes, function( facetValue ) {
      if ( !this.facets[ position ] ) {
        this.facets[ position ] = {
          name : facetName,
          data : {}
        };
        this.facets[ position ][ "data" ][ facetValue ] = 0;
      }
      else if ( !this.facets[ position ][ "data" ][ facetValue ] ) {
        this.facets[ position ][ "data" ][ facetValue ] = 0;
      }
    }, this );
  }, this );

  this.facets = compact( this.facets );
  this.disjunctiveFacets = compact( this.disjunctiveFacets );
};

function getIndices( obj ){
  var indices = {};
  forEach( obj, function( val, idx ){ indices[ val ] = idx; } );
  return indices;
}

module.exports = SearchResults;
