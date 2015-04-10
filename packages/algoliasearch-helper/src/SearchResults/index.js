var forEach = require( "lodash/collection/forEach" );
var compact = require( "lodash/array/compact" );

/**
 * Constructor for SearchResults
 * @class
 * @classdesc SearchResults is an object that contains all the data from a
 * helper query.
 * @param {SearchParameters} state state that led to the response
 * @param {object} algoliaResponse the response from algolia client
 **/
var SearchResults = function( state, algoliaResponse ) {
  var mainSubResponse = algoliaResponse.results[ 0 ];

  /**
   * query used to generate the results
   * @member {string}
   */
  this.query = mainSubResponse.query;
  /**
   * all the hits generated for the query
   * @member {array}
   */
  this.hits = mainSubResponse.hits;
  /**
   * index where the results come from
   * @member {string}
   */
  this.index = mainSubResponse.index;
  /**
   * number of hits per page requested
   * @member {number}
   */
  this.hitsPerPage = mainSubResponse.hitsPerPage;
  /**
   * total number of hits of this query on the index
   * @member {number}
   */
  this.nbHits = mainSubResponse.nbHits;
  /**
   * total number of pages with respect to the number of hits per page and the total number of hits
   * @member {number}
   */
  this.nbPages = mainSubResponse.nbPages;
  /**
   * current page
   * @member {number}
   */
  this.page = mainSubResponse.page;
  /**
   * processing time of the main query
   * @member {number}
   */
  this.processingTimeMS = mainSubResponse.processingTimeMS;
  /**
   * disjunctive facets results
   * @member {array}
   */
  this.disjunctiveFacets = [];
  /**
   * other facets results
   * @member {array}
   */
  this.facets = [];

  var disjunctiveFacets = state.getRefinedDisjunctiveFacets();

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
      assignFacetStats( this.disjunctiveFacets[ position ], mainSubResponse.facets_stats, facetKey );
      assignFacetTimeout( this.disjunctiveFacets[ position ], state.getRankingInfo, mainSubResponse.timeoutCounts, facetKey);
    }
    else {
      var position = facetsIndices[ facetKey ];
      this.facets[ position ] = {
        name : facetKey,
        data : facetValueObject
      };
      assignFacetStats( this.facets[ position ], mainSubResponse.facets_stats, facetKey );
      assignFacetTimeout( this.facets[ position ], state.getRankingInfo, mainSubResponse.timeoutCounts, facetKey);
    }
  }, this );

  // aggregate the refined disjunctive facets
  forEach( disjunctiveFacets, function( disjunctiveFacet, idx ) {
    var result = algoliaResponse.results[ idx + 1 ];

    // There should be only item in facets.
    forEach( result.facets, function( facetResults, dfacet ){
      var position = disjunctiveFacetsIndices[ dfacet ];

      this.disjunctiveFacets[ position ] = {
        name : dfacet,
        data : facetResults
      };
      assignFacetStats( this.disjunctiveFacets[ position ], result.facets_stats, dfacet );
      assignFacetTimeout( this.disjunctiveFacets[ position ], state.getRankingInfo, result.timeoutCounts, dfacet);

      if ( state.disjunctiveFacetsRefinements[dfacet] ) {
        forEach( state.disjunctiveFacetsRefinements[ dfacet ], function( refinementValue ){
          // add the disjunctive refinements if it is no more retrieved
          if ( !this.disjunctiveFacets[position].data[refinementValue] &&
               state.disjunctiveFacetsRefinements[dfacet].indexOf(refinementValue) > -1 ) {
            this.disjunctiveFacets[position].data[refinementValue] = 0;
          }
        }, this );
      }
    }, this );
  }, this );

  // add the excludes
  forEach( state.facetsExcludes, function( excludes, facetName ) {
    var position = facetsIndices[ facetName ];
    this.facets[ position ] = {
      name : facetName,
      data : mainSubResponse.facets[ facetName ]
    };
    forEach( excludes, function( facetValue ) {
      this.facets[ position ] = this.facets[ position ] || { name : facetName };
      this.facets[ position ].data = this.facets[ position ].data || {};
      this.facets[ position ].data[ facetValue ] = 0;
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

function assignFacetStats( dest, facets_stats, key ) {
  if ( facets_stats && facets_stats[key] ) {
    dest.stats = facets_stats[key];
  }
}

function assignFacetTimeout( dest, timeoutCounts, getRankingInfo ) {
  if ( getRankingInfo ) {
    dest.timeout = !!( timeoutCounts );
  }
}

module.exports = SearchResults;
