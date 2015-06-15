"use strict";
var test = require( "tape" );
var SearchParameters = require( "../../src/SearchParameters" );

test( "getUnrefinedDisjunctiveFacets : should return all non refined disjunctive facet", function( t ) {
  var state0 = SearchParameters.make( {
    disjunctiveFacets : [ "facet1", "facet2", "facet3" ]
  } );

  var state1 = state0.addDisjunctiveFacetRefinement( "facet1", "a" )
                     .addDisjunctiveFacetRefinement( "facet3", "x" )
                     .addDisjunctiveFacetRefinement( "facet1", "abc" );

  t.deepEqual( state1.getUnrefinedDisjunctiveFacets(), [ "facet2" ], "Should only return [ facet2 ]" );

  t.end();
} );
