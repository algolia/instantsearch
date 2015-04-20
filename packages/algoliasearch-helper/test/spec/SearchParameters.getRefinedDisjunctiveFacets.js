"use strict";

var test = require( "tape" );
//var _ = require( "lodash" );
var SearchParameters = require( "../../src/SearchParameters" );

test( "getRefinedDisjunctiveFacets should return the refined facets declared as disjunctive", function( t ) {
  var sp = new SearchParameters( {
    disjunctiveFacets : [ "myNumericFacet" ]
  } );

  t.equal( sp.getRefinedDisjunctiveFacets().length, 0, "Should be empty at first" );
  sp.addNumericRefinement( "myNumericFacet", ">", 3 );
  t.equal( sp.getRefinedDisjunctiveFacets().indexOf( "myNumericFacet" ), 0, "Should contain myNumericFacet" );

  t.end();
} );

test( "getRefinedDisjunctiveFacets should return the refined once even if there are multiple filters on the same facet", function( t ) {
  var sp = new SearchParameters( {
    disjunctiveFacets : [ "myNumericFacet" ]
  } );

  t.equal( sp.getRefinedDisjunctiveFacets().length, 0, "Should be empty at first" );
  sp.addNumericRefinement( "myNumericFacet", ">", 3 );
  sp.addNumericRefinement( "myNumericFacet", "=", 3 );
  t.equal( sp.getRefinedDisjunctiveFacets().indexOf( "myNumericFacet" ), 0, "Should contain myNumericFacet" );

  t.end();
} );

test( "getRefinedDisjunctiveFactes should not return refined normal facets", function( t ) {
  var sp = new SearchParameters( {
    facets : [ "myNumericFacet" ]
  } );

  t.equal( sp.getRefinedDisjunctiveFacets().length, 0, "Should be empty at first" );
  sp.addNumericRefinement( "myNumericFacet", ">", 3 );
  t.equal( sp.getRefinedDisjunctiveFacets().length, 0, "Should still be empty" );

  t.end();
} );
