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
  this.client = client;
  this.index = index;
  this.state = new SearchParameters( options );
  this.extraQueries = [];
}

util.inherits( AlgoliaSearchHelper, events.EventEmitter );

/**
 * Perform a query
 * @param  {string} q the user query
 * @param {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.search = function( q, holdSearch ) {
  this.state = this.state.setQuery( q )
                         .setPage( 0 );

  this.emit( "change", this.state );
  if( !holdSearch ) {
    this._search();
  }
};

/**
 * Remove all refinements (disjunctive + conjunctive + excludes )
 * @param {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.clearRefinements = function( holdSearch ) {
  this.state = this.state.clearRefinements();
  this.emit( "change", this.state );
  if( !holdSearch ) {
    this._search();
  }
};

/**
 * Ensure a facet refinement exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @param {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.addDisjunctiveRefine = function( facet, value, holdSearch ) {
  this.state = this.state.addDisjunctiveFacetRefinement( facet, value );
  this.emit( "change", this.state );
  if( !holdSearch ) {
    this._search();
  }
};

/**
 * Ensure a facet refinement does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @param {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.removeDisjunctiveRefine = function( facet, value, holdSearch ) {
  this.state = this.state.removeDisjunctiveFacetRefinement( facet, value );
  this.emit( "change", this.state );
  if( !holdSearch ) {
    this._search();
  }
};

/**
 * Add a numeric refinement on the given attribute
 * @param  {string} attribute
 * @param  {string} operator
 * @param  {number} value
 * @param {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.addNumericRefinement = function( attribute, operator, value, holdSearch ){
  this.state = this.state.addNumericRefinement( attribute, operator, value );
  this.emit( "change", this.state );
  if( !holdSearch ){
    this._search();
  }
}

/**
 *
 */
AlgoliaSearchHelper.prototype.removeNumericRefinement = function( attribute, operator, value, holdSearch ){
  this.state = this.state.removeNumericRefinement( attribute, operator, value );
  this.emit( "change", this.state );
  if( !holdSearch ){
    this._search();
  }
}

/**
 * Ensure a facet refinement exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @param {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.addRefine = function( facet, value, holdSearch ) {
  this.state = this.state.addFacetRefinement( facet, value );
  this.emit( "change", this.state );
  if( !holdSearch ) {
    this._search();
  }
};

/**
 * Ensure a facet refinement does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @param {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.removeRefine = function( facet, value, holdSearch ) {
  this.state = this.state.removeFacetRefinement( facet, value );
  this.emit( "change", this.state );
  if( !holdSearch ){
    this._search();
  }
};

/**
 * Ensure a facet exclude exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @param {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.addExclude = function( facet, value, holdSearch ) {
  this.state = this.state.addExcludeRefinement( facet, value );
  this.emit( "change", this.state );
  if( !holdSearch ){
    this._search();
  }
};

/**
 * Ensure a facet exclude does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @param {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.removeExclude = function( facet, value, holdSearch ) {
  this.state = this.state.removeExcludeRefinement( facet, value );
  this.emit( "change", this.state );
  if( !holdSearch ){
    this._search();
  }
};

/**
 * Toggle refinement state of an exclude
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @return {boolean} true if the facet has been found
 * @param {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.toggleExclude = function( facet, value, holdSearch ) {
  this.state = this.state.toggleExcludeFacetRefinement( facet, value );
  this.emit( "change", this.state );
  if( !holdSearch ){
    this._search();
  }
};

/**
 * Toggle refinement state of a facet
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @param  {boolean} holdSearch Optionnal parameter to specify that the search should not be triggered right away
 */
AlgoliaSearchHelper.prototype.toggleRefine = function( facet, value, holdSearch ) {
  if( this.state.facets.indexOf( facet ) > -1 ) {
    this.state = this.state.toggleFacetRefinement( facet, value );
    this.emit( "change", this.state );
  }
  else if( this.state.disjunctiveFacets.indexOf( facet ) > -1 ) {
    this.state = this.state.toggleDisjunctiveFacetRefinement( facet, value );
    this.emit( "change", this.state );
  }
  else {
    console.log( "warning : you're trying to refine the undeclared facet '" + facet +
                "'; add it to the helper parameter 'facets' or 'disjunctiveFacets'" );
  }
  if( !holdSearch ) {
    this._search();
  }
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
};

/**
 * Go to next page
 */
AlgoliaSearchHelper.prototype.nextPage = function( holdSearch ) {
  this.setPage( this.state.page + 1, holdSearch );
};

/**
 * Go to previous page
 */
AlgoliaSearchHelper.prototype.previousPage = function( holdSearch ) {
  this.setPage( this.state.page - 1, holdSearch );
};

/**
 * Change the current page
 * @param  {integer} page The page number
 */
AlgoliaSearchHelper.prototype.setPage = function( page, holdSearch ) {
  if( page < 0 ) throw new Error( "Page requested below 0." );

  this.state = this.state.setPage( page );
  this.emit( "change", this.state );

  if( !holdSearch ){
    this._search();
  }
};

/**
 * Configure the underlying index name
 * @param {string} name the index name
 */
AlgoliaSearchHelper.prototype.setIndex = function( name ) {
  this.index = name;
  this._search();
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
AlgoliaSearchHelper.prototype.getCurrentPage = function() {
  return this.state.page;
};

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
  this.client.addQueryInBatch( this.index, this.state.query, this._getHitsSearchParams() );

  //One for each disjunctive facets
  forEach( this.state.getRefinedDisjunctiveFacets(), function( refinedFacet ) {
    this.client.addQueryInBatch( this.index, this.state.query, this._getDisjunctiveFacetSearchParams( refinedFacet ) );
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
  forEach( this.state.facetsExcludes, function( excludes, facetName ) {
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
 * @return {object.<string, any>}
 */
AlgoliaSearchHelper.prototype._getHitsSearchParams = function() {
  var facets = this.state.facets.concat( this.state.getUnrefinedDisjunctiveFacets() );
  var facetFilters = this._getFacetFilters();
  var numericFilters = this._getNumericFilters();
  var additionalParams = {
    facets : facets,
    distinct : false
  };

  if( facetFilters.length > 0 ) {
    additionalParams.facetFilters = facetFilters;
    additionalParams.distinct = this.state.distinct || false;
  }

  if( numericFilters.length > 0 ){
    additionalParams.numericFilters = numericFilters;
  }

  return extend( this.state.getQueryParams(), additionalParams );
};

/**
 * Build search parameters used to fetch a disjunctive facet
 * @private
 * @param  {string} facet the associated facet name
 * @return {hash}
 */
AlgoliaSearchHelper.prototype._getDisjunctiveFacetSearchParams = function( facet ) {
  var facetFilters = this._getFacetFilters( facet )
  var numericFilters = this._getNumericFilters();
  var additionalParams = {
    hitsPerPage : 1,
    page : 0,
    attributesToRetrieve : [],
    attributesToHighlight : [],
    attributesToSnippet : [],
    facets : facet,
    distinct : false
  };

  if( numericFilters.length > 0 ){
    additionalParams.numericFilters = numericFilters;
  }

  if( facetFilters > 0 ){
    additionalParams.facetFilters = facetFilters;
    additionalParams.distinct = this.state.distinct || false;
  }

  return extend( this.state.getQueryParams(), additionalParams );
};

/**
 * Return the numeric filters in an algolia request fashion
 * @private
 * @return {array.<string>} the numeric filters in the algolia format
 */
AlgoliaSearchHelper.prototype._getNumericFilters = function() {
  var numericFilters = [];
  forEach( this.state.numericRefinements, function( operators, attribute ){
    forEach( operators, function( value, operator ) {
      numericFilters.push( attribute + operator + value );
    } );
  } );
  return numericFilters;
}

/**
 * Test if there are some disjunctive refinements on the facet
 * @private
 */
AlgoliaSearchHelper.prototype._hasDisjunctiveRefinements = function( facet ) {
  return this.state.disjunctiveRefinements[ facet ] &&
         this.state.disjunctiveRefinements[ facet ].length > 0;
};

/**
 * Build facetFilters parameter based on current refinements. The array returned
 * contains strings representing the facet filters in the algolia format.
 * @private
 * @param  {string} facet if set, the current disjunctive facet
 * @return {array.<string>}
 */
AlgoliaSearchHelper.prototype._getFacetFilters = function( facet ) {
  var facetFilters = [];

  forEach( this.state.facetsRefinements, function( facetValue, facetName ) {
    facetFilters.push( facetName + ":" + facetValue );
  } );

  forEach( this.state.facetsExcludes, function( facetValues, facetName ) {
    forEach( facetValues, function( facetValue ) {
      facetFilters.push( facetName + ":-" + facetValue );
    } );
  } );

  forEach( this.state.disjunctiveFacetsRefinements, function( facetValues, facetName ) {
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
