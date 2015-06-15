"use strict";
var test = require( "tape" );
var SearchParameters = require( "../../src/SearchParameters" );

test( "addFacetRefinement : should add a new item", function( t ) {
  var initialState = SearchParameters.make();

  t.deepEqual( initialState.facetsRefinements, {}, "facetsRefinements should be empty at first" );
  var state1 = initialState.addFacetRefinement( "facetName", "facetValue1" );
  t.deepEqual( state1.facetsRefinements, { facetName : [ "facetValue1" ] } );

  t.end();
} );

test( "addFacetRefinement : should be able to add more than one item", function( t ) {
  var state = SearchParameters.make()
                              .addFacetRefinement( "facetName", "facetValue1" )
                              .addFacetRefinement( "facetName", "facetValue2" )
                              .addFacetRefinement( "facetName", "facetValue3" );

  t.deepEqual( state.facetsRefinements, { facetName : [ "facetValue1", "facetValue2", "facetValue3" ] } );

  t.end();
} );

test( "addFacetRefinement : should be able to add values for different facet", function( t ) {
  var state = SearchParameters.make()
                              .addFacetRefinement( "facetName1", "facetValue1" )
                              .addFacetRefinement( "facetName2", "facetValue2" )
                              .addFacetRefinement( "facetName2", "facetValue4" )
                              .addFacetRefinement( "facetName3", "facetValue3" );

  t.deepEqual( state.facetsRefinements, {
    facetName1 : [ "facetValue1" ],
    facetName2 : [ "facetValue2", "facetValue4" ],
    facetName3 : [ "facetValue3" ]
  } );

  t.end();
} );
