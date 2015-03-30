"use strict";
var SearchParameters = require( "./SearchParameters" );
var extend = require( "./functions/extend" );
var util = require( "util" );
var events = require( "events" );
var forEach = require( "lodash/collection/forEach" );
var bind = require( "lodash/function/bind" );

/**
 * Initialize a new AlgoliaSearchHelper
 * @class
 * @param  {AlgoliaSearch} client an AlgoliaSearch client
 * @param  {string} index the index name to query
 * @param  {hash} options an associative array defining the hitsPerPage, list of facets and list of disjunctive facets
 */
function AlgoliaSearchHelper( client, index, options ) {
  var defaults = AlgoliaSearchHelper.optionsDefaults;
  var optionsWithDefaults = extend( {}, defaults, options );

  this.client = client;
  this.index = index;
  this.options = optionsWithDefaults;
  this.state = new SearchParameters( options );

  this.refinements = {};
  this.excludes = {};
  this.disjunctiveRefinements = {};
  this.extraQueries = [];
}

util.inherits( AlgoliaSearchHelper, events.EventEmitter );

/**
 * Perform a query
 * @param  {string} q the user query
 * @param  {function} searchCallback the result callback called with two arguments:
 *  err : an error is something wrong occured or null
 *  content: the query answer with an extra 'disjunctiveFacets' attribute
 * @param  {object} searchParams contains options to pass to the inner algolia client
 * @return {undefined | Promise} If a callback is provided then it returns
 *  undefined, otherwise it gives the results through a promise.
 */
AlgoliaSearchHelper.prototype.search = function( q, searchParams ) {
  this.state = this.state.setPage( 0 );
  this.q = q;
  this.searchParams = searchParams || {};
  this.refinements = this.refinements || {};
  this.disjunctiveRefinements = this.disjunctiveRefinements || {};
  return this._search();
};

/**
 * Remove all refinements (disjunctive + conjunctive)
 */
AlgoliaSearchHelper.prototype.clearRefinements = function() {
  this.disjunctiveRefinements = {};
  this.refinements = {};
};

/**
 * Ensure a facet refinement exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.addDisjunctiveRefine = function( facet, value ) {
  this.state = this.state.addDisjunctiveFacetRefinement( facet, value);
};

/**
 * Ensure a facet refinement does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.removeDisjunctiveRefine = function( facet, value ) {
  this.state = this.state.removeDisjunctiveFacetRefinement( facet, value );
};

/**
 * Ensure a facet refinement exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.addRefine = function( facet, value ) {
  this.state = this.state.addFacetRefinement( facet, value );
};

/**
 * Ensure a facet refinement does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.removeRefine = function( facet, value ) {
  this.state = this.state.removeFacetRefinement( facet, value );
};

/**
 * Ensure a facet exclude exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.addExclude = function( facet, value ) {
  this.state = this.state.addExcludeRefinement( facet, value );
};

/**
 * Ensure a facet exclude does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.removeExclude = function( facet, value ) {
  this.state = this.state.removeExcludeRefinement( facet, value );
};

/**
 * Toggle refinement state of an exclude
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @return {boolean} true if the facet has been found
 */
AlgoliaSearchHelper.prototype.toggleExclude = function( facet, value ) {
  this.state = this.state.toggleExcludeFacetRefinement( facet, value );
  this._search();
};

/**
 * Toggle refinement state of a facet
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.toggleRefine = function( facet, value ) {
  if( this.state.facets.indexOf( facet ) > -1 ) {
    this.state = this.state.toggleFacetRefinement( facet, value );
  }
  else if( this.state.disjunctiveFacets.indexOf( facet ) > -1 ) {
    this.state = this.state.toggleDisjunctiveFacetRefinement( facet, value );
  }
  else {
    console.log( "warning : you're trying to refine the undeclared facet '" + facet +
                "'; add it to the helper parameter 'facets' or 'disjunctiveFacets'");
  }
  this._search();
};

/**
 * Check the refinement state of a facet
 * @param  {string}  facet the facet
 * @param  {string}  value the associated value
 * @return {boolean} true if refined
 */
AlgoliaSearchHelper.prototype.isRefined = function( facet, value ) {
  return this.state.isFacetRefined( facet, value );
};

/**
 * Check the exclude state of a facet
 * @param  {string}  facet the facet
 * @param  {string}  value the associated value
 * @return {boolean} true if refined
 */
AlgoliaSearchHelper.prototype.isExcluded = function( facet, value ) {
  return this.state.isExcludeRefined( facet, value );
};

/**
 * Check the refinement state of the disjunctive facet
 * @param  {string}  facet the facet
 * @param  {string}  value the associated value
 * @return {boolean} true if refined
 */
AlgoliaSearchHelper.prototype.isDisjunctiveRefined = function( facet, value ) {
  return this.state.isDisjunctiveFacetRefined( facet, value );
}

/**
 * Go to next page
 */
AlgoliaSearchHelper.prototype.nextPage = function() {
  this.setPage( this.state.page + 1 );
};

/**
 * Go to previous page
 */
AlgoliaSearchHelper.prototype.previousPage = function() {
  this.setPage( this.state.page - 1 );
};

/**
 * Change the current page
 * @param  {integer} page The page number
 */
AlgoliaSearchHelper.prototype.setPage = function( page ) {
  if( page < 0 ) throw new Error( "Page requested below 0." );

  this.state = this.state.setPage( page );
  this._search();
};

/**
 * Configure the underlying index name
 * @param {string} name the index name
 */
AlgoliaSearchHelper.prototype.setIndex = function( name ) {
  this.index = name;
};

/**
 * Get the underlying configured index name
 */
AlgoliaSearchHelper.prototype.getIndex = function() {
  return this.index;
};

/**
 * Get the currently selected page
 * @return Number the current page
 */
AlgoliaSearchHelper.prototype.getCurrentPage = function(){
  return this.state.page;
}

/**
 * Clear the extra queries added to the underlying batch of queries
 */
AlgoliaSearchHelper.prototype.clearExtraQueries = function() {
  this.extraQueries = [];
};

/**
 * Add an extra query to the underlying batch of queries. Once you add queries
 * to the batch, the 2nd parameter of the searchCallback will be an object with a `results`
 * attribute listing all search results.
 */
AlgoliaSearchHelper.prototype.addExtraQuery = function( index, query, params ) {
  this.extraQueries.push( { index : index, query : query, params : ( params || {} ) } );
};

///////////// PRIVATE

/**
 * Perform the underlying queries
 * @private
 */
AlgoliaSearchHelper.prototype._search = function() {
  this.client.startQueriesBatch();

  //One query for the hits
  this.client.addQueryInBatch( this.index, this.q, this._getHitsSearchParams() );

  //One for each disjunctive facets
  forEach( this.state.getRefinedDisjunctiveFacets(), function( refinedFacet ) {
    this.client.addQueryInBatch( this.index, this.q, this._getDisjunctiveFacetSearchParams( refinedFacet ) );
  }, this );

  //One for each extra query
  forEach( this.extraQueries, function( queryParams ) {
    this.client.addQueryInBatch( queryParams.index, queryParams.query, queryParams.params );
  }, this );

  this.client.sendQueriesBatch( bind( this._handleResponse, this ) );
};

/**
 * Transform the response as sent by the server and transform it into a user
 * usable objet that merge the results of all the batch requests.
 * @private
 * @param disjunctiveFacets {Hash}
 * @param err {Error}
 * @param content {Hash}
 */
AlgoliaSearchHelper.prototype._handleResponse = function( err, content ) {
  if ( err ) {
    this.emit( "error", err );
    return;
  }

  var disjunctiveFacets = this.state.getRefinedDisjunctiveFacets();

  var aggregatedAnswer = content.results[0];
  aggregatedAnswer.disjunctiveFacets = aggregatedAnswer.disjunctiveFacets || {};
  aggregatedAnswer.facets_stats = aggregatedAnswer.facets_stats || {};

  //Since we send request only for disjunctive facets that have been refined,
  //we get the facets informations from the first, general, response.
  forEach( aggregatedAnswer.facets, function( facetValueObject, facetKey ) {
    if( this.state.disjunctiveFacets.indexOf( facetKey ) !== -1 ) {
      aggregatedAnswer.disjunctiveFacets[ facetKey ] = facetValueObject;
      try {
        delete aggregatedAnswer.facets[ facetKey ];
      }
      catch( e ) { aggregatedAnswer.facets = undefined; }
    }
  }, this );


  // aggregate the disjunctive facets
  forEach( disjunctiveFacets, function( disjunctiveFacet, idx ) {
    for ( var dfacet in content.results[idx + 1].facets ) {
      aggregatedAnswer.disjunctiveFacets[dfacet] = content.results[idx + 1].facets[dfacet];
      if ( this.state.disjunctiveFacetsRefinements[dfacet] ) {
        forEach( this.state.disjunctiveFacetsRefinements[ dfacet ], function( refinementValue ){
          // add the disjunctive refinements if it is no more retrieved
          if ( !aggregatedAnswer.disjunctiveFacets[dfacet][refinementValue] &&
               this.state.disjunctiveFacetsRefinements[dfacet].indexOf(refinementValue) > -1 ) {
            aggregatedAnswer.disjunctiveFacets[dfacet][refinementValue] = 0;
          }
        }, this);
      }
    }
    // aggregate the disjunctive facets stats
    for ( var stats in content.results[idx + 1].facets_stats ) {
      aggregatedAnswer.facets_stats[stats] = content.results[idx + 1].facets_stats[stats];
    }
  }, this );

  // add the excludes
  forEach( this.state.facetsExcludes, function( excludes, facetName ){
    aggregatedAnswer.facets[ facetName ] = aggregatedAnswer.facets[ facetName ] || {};
    forEach( excludes, function( facetValue ) {
      if ( !aggregatedAnswer.facets[ facetName ][ facetValue ] ) {
        aggregatedAnswer.facets[ facetName ][ facetValue ] = 0;
      }
    } );   
  } );

  // call the actual callback
  if ( this.extraQueries.length === 0 ) {
    this.emit( "result", aggregatedAnswer );
  }
  else {
    // append the extra queries
    var c = { results : [ aggregatedAnswer ] };
    for ( var i = 0; i < this.extraQueries.length; ++i ) {
      c.results.push( content.results[1 + disjunctiveFacets.length + i] );
    }
    this.emit( "result", c );
  }
};

/**
 * Build search parameters used to fetch hits
 * @private
 * @return {hash}
 */
AlgoliaSearchHelper.prototype._getHitsSearchParams = function() {
  var facets = this.state.facets.concat( this.state.getUnrefinedDisjunctiveFacets() );

  return extend( {}, {
    hitsPerPage : this.state.hitsPerPage,
    page : this.state.page,
    facets : facets,
    facetFilters : this._getFacetFilters()
  }, this.searchParams );
};

/**
 * Build search parameters used to fetch a disjunctive facet
 * @private
 * @param  {string} facet the associated facet name
 * @return {hash}
 */
AlgoliaSearchHelper.prototype._getDisjunctiveFacetSearchParams = function( facet ) {
  return extend( {}, this.searchParams, {
    hitsPerPage : 1,
    page : 0,
    attributesToRetrieve : [],
    attributesToHighlight : [],
    attributesToSnippet : [],
    facets : facet,
    facetFilters : this._getFacetFilters( facet )
  } );
};

/**
 * Test if there are some disjunctive refinements on the facet
 * @private
 */
AlgoliaSearchHelper.prototype._hasDisjunctiveRefinements = function( facet ) {
  return this.state.disjunctiveRefinements[ facet ] &&
         this.state.disjunctiveRefinements[ facet ].length > 0;
};

/**
 * Build facetFilters parameter based on current refinements
 * @private
 * @param  {string} facet if set, the current disjunctive facet
 * @return {hash}
 */
AlgoliaSearchHelper.prototype._getFacetFilters = function( facet ) {
  var facetFilters = [];

  forEach( this.state.facetsRefinements, function( facetValue, facetName ){
    facetFilters.push( facetName + ":" + facetValue );
  } );

  forEach( this.state.facetsExcludes, function( facetValues, facetName ){
    forEach( facetValues, function( facetValue ) {
      facetFilters.push( facetName + ":-" + facetValue );
    } );
  } );

  forEach( this.state.disjunctiveFacetsRefinements, function( facetValues, facetName ){
    if( facetName === facet ) return;
    var orFilters = [];
    forEach( facetValues, function( facetValue ) {
      orFilters.push( facetName + ":" + facetValue );
    } );
    facetFilters.push( orFilters );
  } );

  return facetFilters;
};

module.exports = AlgoliaSearchHelper;
