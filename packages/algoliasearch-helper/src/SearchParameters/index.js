var defaults = require( "lodash/object/defaults" );

var SearchParameters = function( newParameters ) {
  var newParametersWithDefaults = defaults( newParameters || {},
                                            SearchParameters.defaults );
  //Query
  this.query = newParametersWithDefaults.query;
  //Facets
  this.facets = newParametersWithDefaults.facets;
  this.disjunctiveFacets = newParametersWithDefaults.disjunctiveFacets;
  //Refinements
  this.facetsRefinments = newParametersWithDefaults.facetsRefinments;
  this.facetsExcludes = newParametersWithDefaults.facetsExcludes;
  this.disjunctiveFacetsRefinements = newParametersWithDefaults.disjunctiveFacetsRefinements;
  //Misc. parameters
  this.nbHits = newParametersWithDefaults.nbHits;
  this.page = newParametersWithDefaults.page;
};

SearchParameters.defaults = {
  query : "",
  facets : [],
  disjunctiveFacets : [],
  facetsRefinments : {},
  facetsExcludes : {},
  disjunctiveFacetsRefinements : {},
  nbHits : 0,
  page: 0
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
  addFacetRefinement : function addFacetRefinement( facet, value ){
    return this.mutateMe( function( m ){
      m.facetsRefinments[ facet ] = value;
    } );
  },
  addExcludeRefinement : function addExcludedValue( facet, value ){
    return this.mutateMe( function( m ){
      if( !m.facetsRefinments[ facet ] ) {
        m.facetsExcludes[ facet ] = [];
      }
      m.facetsExcludes[ facet ].push( value );
    } );
  },
  addDisjunctiveFacetRefinement : function addDisjunctiveFacetRefinement( facet, value){
    return this.mutateMe( function( m ){
      if( !m.facetsRefinments[ facet ] ) {
        m.disjunctiveFacetsRefinements[ facet ] = [];
      }
      m.disjunctiveFacetsRefinements[ facet ].push( value );
    } );
  },
  removeFacetRefinement : function removeFacetRefinement( facet, value ){
    return this.mutateMe( function( m ){
      delete m.facetsRefinments[ facet ];
    } );
  },
  removeExcludeRefinement : function removeExcludedValue( facet, value ){
    return this.mutateMe( function( m ){
      if( m.facetsExcludes[ facet ] ){
        var idx = m.facetsExcludes[ facet ].indexOf( value );
        m.facetsExcludes[ facets ].splice( idx, 1 );
      }
    } );
  },
  removeDisjunctiveFacetRefinement : function removeDisjunctiveFacetRefinement( facet, value){
    return this.mutateMe( function( m ){
      if( m.disjunctiveFacetsRefinements[ facet ] ){
        var idx = m.disjunctiveFacetsRefinements[ facet ].indexOf( value );
        m.disjunctiveFacetsRefinements[ facets ].splice( idx, 1 );
      }
    } );
  },
  isFacetRefined : function isFacetRefined( facet, value ){
    return this.facetsRefinments[ facet ] === value;
  },
  isExcludeRefined : function isExcludeRefined( facet, value ){
    return this.facetsExcludes[ facet ] &&
           this.facetsExcludes[ facet ].indexOf( value ) !== -1;
  },
  isDisjunctiveFacetRefined : function isDisjunctiveFacetRefined( facet, value){
    return this.disjunctiveFacetsRefinements[ facet ] &&
           this.disjunctiveFacetsRefinements[ facet ].indexOf( value ) !== -1;
  }
};

module.exports = SearchParameters;
