var defaults = require( "lodash/object/defaults" );
var keys = require( "lodash/object/keys" );
var forEach = require( "lodash/collection/forEach" );

var SearchParameters = function( newParameters ) {
  var params = newParameters || {};
  //Query
  this.query = params.query || "";
  //Facets
  this.facets = params.facets || [];
  this.disjunctiveFacets = params.disjunctiveFacets || [];
  //Refinements
  this.facetsRefinements = params.facetsRefinements || {};
  this.facetsExcludes = params.facetsExcludes || {};
  this.disjunctiveFacetsRefinements = params.disjunctiveFacetsRefinements || {};
  //Misc. parameters
  this.hitsPerpage = params.hitsPerpage || 20;
  this.page = params.page || 0;
};

SearchParameters.prototype = {
  constructor : SearchParameters,
  mutateMe : function mutateMe( fn ){
    var newState = new (this.constructor)( this );
    fn( newState );
    return Object.freeze( newState );
  },
  setQuery : function setQuery( newQuery ){
    return this.mutateMe( function( newState ){
      newState.query = newQuery;
    } );
  },
  setPage : function setPage( newPage ){
    return this.mutateMe( function( mutable ){
      mutable.page = newPage;
    });
  },
  setFacets : function setFacets( facets ){
    return this.mutateMe( function( m ){
      m.facets = facets;
    } );
  },
  setHitsPerPage : function setHitsPerPage( n ){
    return this.mutateMe( function( m ){
      m.hitsPerpage = n;
    } );
  },
  addFacetRefinement : function addFacetRefinement( facet, value ){
    return this.mutateMe( function( m ){
      m.facetsRefinements[ facet ] = value;
    } );
  },
  addExcludeRefinement : function addExcludedValue( facet, value ){
    return this.mutateMe( function( m ){
      if( !m.facetsRefinements[ facet ] ) {
        m.facetsExcludes[ facet ] = [];
      }
      m.facetsExcludes[ facet ].push( value );
    } );
  },
  addDisjunctiveFacetRefinement : function addDisjunctiveFacetRefinement( facet, value){
    return this.mutateMe( function( m ){
      if( !m.disjunctiveFacetsRefinements[ facet ] ) {
        m.disjunctiveFacetsRefinements[ facet ] = [];
      }
      m.disjunctiveFacetsRefinements[ facet ].push( value );
    } );
  },
  removeFacetRefinement : function removeFacetRefinement( facet ){
    return this.mutateMe( function( m ){
      delete m.facetsRefinements[ facet ];
    } );
  },
  removeExcludeRefinement : function removeExcludeRefinement( facet, value ){
    return this.mutateMe( function( m ){
      if( m.facetsExcludes[ facet ] ){
        var idx = m.facetsExcludes[ facet ].indexOf( value );
        if( idx > -1 ) m.facetsExcludes[ facet ].splice( idx, 1 );
      }
    } );
  },
  removeDisjunctiveFacetRefinement : function removeDisjunctiveFacetRefinement( facet, value){
    return this.mutateMe( function( m ){
      if( m.disjunctiveFacetsRefinements[ facet ] ){
        var idx = m.disjunctiveFacetsRefinements[ facet ].indexOf( value );
        if( idx > -1 ) m.disjunctiveFacetsRefinements[ facet ].splice( idx, 1 );
      }
    } );
  },
  isFacetRefined : function isFacetRefined( facet, value ){
    return this.facetsRefinements[ facet ] === value;
  },
  isExcludeRefined : function isExcludeRefined( facet, value ){
    return this.facetsExcludes[ facet ] &&
           this.facetsExcludes[ facet ].indexOf( value ) !== -1;
  },
  isDisjunctiveFacetRefined : function isDisjunctiveFacetRefined( facet, value){
    return this.disjunctiveFacetsRefinements[ facet ] &&
           this.disjunctiveFacetsRefinements[ facet ].indexOf( value ) !== -1;
  },
  toggleFacetRefinement : function toggleFacetRefinement( facet, value ){
    if( this.isFacetRefined( facet, value ) ){
      return this.removeFacetRefinement( facet );
    }
    else {
      return this.addFacetRefinement( facet, value );
    }
  },
  toggleExcludeFacetRefinement : function toggleExcludeFacetRefinement( facet, value ){
    if( this.isExcludeRefined( facet, value ) ){
      return this.removeExcludeRefinement( facet, value );
    }
    else {
      return this.addExcludeRefinement( facet, value );
    }
  },
  toggleDisjunctiveFacetRefinement : function toggleDisjunctiveFacetRefinement( facet, value ){
    if( this.isDisjunctiveFacetRefined( facet, value ) ){
      return this.removeDisjunctiveFacetRefinement( facet, value ); 
    }
    else {
      return this.addDisjunctiveFacetRefinement( facet, value );
    }
  },
  /**
   * Returs the names of the refined disjunctiveFacets
   */
  getRefinedDisjunctiveFacets: function getRefinedDisjunctiveFacets(){
    return keys( this.disjunctiveFacetsRefinements );
  },
  getUnrefinedDisjunctiveFacets: function(){
    var unrefinedFacets = [];
    var refinedFacets = this.getRefinedDisjunctiveFacets();
    forEach( this.disjunctiveFacets, function( f ){
      if( refinedFacets.indexOf( f ) === -1 ) {
        unrefinedFacets.push( f );
      }
    } );
    return unrefinedFacets;
  }
};

module.exports = SearchParameters;
