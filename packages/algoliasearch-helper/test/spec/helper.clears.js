"use strict";
var test = require( "tape" ),
    algoliasearchHelper = require( "../../index" ),
    forEach = require( "lodash/collection/forEach" ),
    keys = require( "lodash/object/keys" ),
    isEmpty = require( "lodash/lang/isEmpty" ),
    isUndefined = require( "lodash/lang/isUndefined" );

var init = function init() {
  var helper = algoliasearchHelper( undefined, "Index", {
    facets : ["facet1", "facet2", "both_facet"],
    disjunctiveFacets : ["disjunctiveFacet1", "disjunctiveFacet2", "both_facet"]
  } );

  return helper.toggleRefine( "facet1", "0" )
    .toggleRefine( "facet2", "0" )
    .toggleRefine( "disjunctiveFacet1", "0" )
    .toggleRefine( "disjunctiveFacet2", "0" )
    .toggleExclude( "excluded1", "0" )
    .toggleExclude( "excluded2", "0" )
    .addNumericRefinement( "numeric1", ">=", "0" )
    .addNumericRefinement( "numeric1", "<", "10" )
    .addNumericRefinement( "numeric2", ">=", 0 )
    .addNumericRefinement( "numeric2", "<", 10 );
};

test( "Check that the state objects match how we test them", function( t ) {
  var helper = init();

  t.deepEqual( helper.state.facetsRefinements, { "facet1" : [ "0" ], "facet2" : [ "0" ] } );
  t.deepEqual( helper.state.disjunctiveFacetsRefinements, { "disjunctiveFacet1" : [ "0" ], "disjunctiveFacet2" : [ "0" ] } );
  t.deepEqual( helper.state.facetsExcludes, { "excluded1" : [ "0" ], "excluded2" : [ "0" ] } );
  t.deepEqual( helper.state.numericRefinements, { "numeric1" : { ">=" : "0", "<" : "10" }, "numeric2" : { ">=" : 0, "<" : 10 } } );

  t.end();
} );

test( "Clear with a name should work on every type and not remove others than targetted name", function( t ) {
  var helper = init();

  helper.clearRefinements( "facet1" );
  t.deepEqual( helper.state.facetsRefinements, { "facet2" : [ "0" ] } );

  helper.clearRefinements( "disjunctiveFacet1" );
  t.deepEqual( helper.state.disjunctiveFacetsRefinements, { "disjunctiveFacet2" : [ "0" ] } );

  helper.clearRefinements( "excluded1" );
  t.deepEqual( helper.state.facetsExcludes, { "excluded2" : [ "0" ] } );

  helper.clearRefinements( "numeric1" );
  t.deepEqual( helper.state.numericRefinements, { "numeric2" : { ">=" : 0, "<" : 10 } } );

  t.end();
} );


test( "Clearing the same field from multiple elements should remove it everywhere", function( t ) {
  var helper = init();

  helper.addNumericRefinement( "facet1", ">=", "10" ).toggleExclude( "facet1", "value" );

  t.deepEqual( helper.state.facetsRefinements.facet1, [ "0" ] );
  t.deepEqual( helper.state.numericRefinements.facet1, { ">=" : "10" } );
  t.deepEqual( helper.state.facetsExcludes.facet1, [ "value" ] );

  helper.clearRefinements( "facet1" );
  t.assert( isUndefined( helper.state.facetsRefinements.facet1 ) );
  t.assert( isUndefined( helper.state.numericRefinements.facet1 ) );
  t.assert( isUndefined( helper.state.facetsExcludes.facet1 ) );

  t.end();
} );

test( "Clear with a function : neutral and abosorbing ops", function( t ) {
  var helper = init();
  var state0 = helper.state;

  helper.clearRefinements( function( value, key, type ) {
    return false;
  } );

  t.deepEqual( helper.state.numericRefinements, state0.numericRefinements, "Neutral op : numeric ref should be equal" );
  t.deepEqual( helper.state.facetsRefinements, state0.facetsRefinements, "Neutral op : conj ref should be equal" );
  t.deepEqual( helper.state.facetsExcludes, state0.facetsExcludes, "Neutral op : exclude ref should be equal" );
  t.deepEqual( helper.state.disjunctiveFacetsRefinements, state0.disjunctiveFacetsRefinements, "Neutral op : disj ref should be equal" );

  helper.clearRefinements( function( value, key, type ) {
    return true;
  } );

  t.assert( isEmpty( helper.state.numericRefinements ), "remove all numericRefinements" );
  t.assert( isEmpty( helper.state.facetsRefinements ), "remove all facetsRefinements" );
  t.assert( isEmpty( helper.state.facetsExcludes ), "remove all facetsExcludes" );
  t.assert( isEmpty( helper.state.disjunctiveFacetsRefinements ), "remove all disjunctiveFacetsRefinements" );

  t.end();
} );

test( "Clear with a function : filtering", function( t ) {
  var helper = init();

  var checkType = {
    numeric : false,
    disjunctiveFacet : false,
    conjunctiveFacet : false,
    exclude : false
  };

  helper.clearRefinements( function( value, key, type ) {
    checkType[ type ] = true;

    return key.indexOf( "1" ) !== -1;
  } );

  t.equal( keys( checkType ).length, 4, "There should be only 4 refinements" );
  forEach( checkType, function( typeTest, type ) { t.ok( typeTest, "clear should go through : " + type ); } );

  t.deepEqual( helper.state.facetsRefinements, { "facet2" : [ "0" ] } );
  t.deepEqual( helper.state.disjunctiveFacetsRefinements, { "disjunctiveFacet2" : [ "0" ] } );
  t.deepEqual( helper.state.facetsExcludes, { "excluded2" : [ "0" ] } );
  t.deepEqual( helper.state.numericRefinements, { "numeric2" : { ">=" : 0, "<" : 10 } } );

  t.end();
} );

test( "Clearing twice the same attribute should be not problem", function( t ) {
  var helper = init();

  t.deepEqual( helper.state.facetsRefinements.facet1, [ "0" ] );
  helper.clearRefinements( "facet1" );
  t.assert( isUndefined( helper.state.facetsRefinements.facet1 ) );
  t.doesNotThrow( function() {
    helper.clearRefinements( "facet1" );
  } );

  t.deepEqual( helper.state.disjunctiveFacetsRefinements.disjunctiveFacet1, [ "0" ] );
  helper.clearRefinements( "disjunctiveFacet1" );
  t.assert( isUndefined( helper.state.disjunctiveFacetsRefinements.disjunctiveFacet1 ) );
  t.doesNotThrow( function() {
    helper.clearRefinements( "disjunctiveFacet1" );
  } );

  t.deepEqual( helper.state.facetsExcludes.excluded1, [ "0" ] );
  helper.clearRefinements( "excluded1" );
  t.assert( isUndefined( helper.state.facetsExcludes.excluded1 ) );
  t.doesNotThrow( function() {
    helper.clearRefinements( "excluded1" );
  } );

  t.deepEqual( helper.state.numericRefinements.numeric1, { ">=" : "0", "<" : "10" } );
  helper.clearRefinements( "numeric1" );
  t.assert( isUndefined( helper.state.numericRefinements.numeric1 ) );
  t.doesNotThrow( function() {
    helper.clearRefinements( "numeric1" );
  } );

  t.end();
} );
