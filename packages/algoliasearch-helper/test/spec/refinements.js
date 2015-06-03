"use strict";
var test = require( "tape" );
var _ = require( "lodash" );
var algoliasearchHelper = require( "../../index" );


test( "Adding refinments should add an entry to the refinments attribute", function( t ) {
  var helper = algoliasearchHelper( {}, "index", {} );

  var facetName = "facet1";
  var facetValue = "42";

  t.ok( _.isEmpty( helper.state.facetsRefinements ), "should be empty at first" );
  helper.addRefine( facetName, facetValue );
  t.ok( _.size( helper.state.facetsRefinements ) === 1, "when adding a refinment, should have one" );
  t.deepEqual( helper.state.facetsRefinements.facet1, [ facetValue ] );
  helper.addRefine( facetName, facetValue );
  t.ok( _.size( helper.state.facetsRefinements ) === 1, "when adding the same, should still be one" );
  helper.removeRefine( facetName, facetValue );
  t.ok( _.size( helper.state.facetsRefinements ) === 0, "Then empty " );
  t.end();
} );

test( "Adding several refinements for a single attribute should be handled", function( t ) {
  var facetName = "facet";

  var helper = algoliasearchHelper( null, null, {
    facets : [ facetName ]
  } );

  t.ok( _.isEmpty( helper.state.facetsRefinements ), "empty" );
  helper.addRefine( facetName, "value1" );
  t.ok( _.size( helper.state.facetsRefinements[ facetName ] ) === 1, "Adding one refinement, should have one" );
  helper.addRefine( facetName, "value2" );
  t.ok( _.size( helper.state.facetsRefinements[ facetName ] ) === 2, "Adding another refinement, should have two" );
  helper.addRefine( facetName, "value1" );
  t.ok( _.size( helper.state.facetsRefinements[ facetName ] ) === 2, "Adding same refinement as the first, should have two" );

  t.end();
} );

test( "Toggling several refinements for a single attribute should be handled", function( t ) {
  var facetName = "facet";

  var helper = algoliasearchHelper( null, null, {
    facets : [ facetName ]
  } );

  t.ok( _.isEmpty( helper.state.facetsRefinements ), "empty" );
  helper.toggleRefine( facetName, "value1" );
  t.ok( _.size( helper.state.facetsRefinements[ facetName ] ) === 1, "Adding one refinement, should have one" );
  helper.toggleRefine( facetName, "value2" );
  t.ok( _.size( helper.state.facetsRefinements[ facetName ] ) === 2, "Adding another refinement, should have two" );
  helper.toggleRefine( facetName, "value1" );
  t.ok( _.size( helper.state.facetsRefinements[ facetName ] ) === 1, "Adding same refinement as the first, should have two" );
  t.deepEqual( helper.state.facetsRefinements[ facetName ], [ "value2" ], "should contain value2" );

  t.end();
} );

test( "Removing several refinements for a single attribute should be handled", function( t ) {
  var facetName = "facet";

  var helper = algoliasearchHelper( null, null, {
    facets : [ facetName ]
  } );

  t.ok( _.isEmpty( helper.state.facetsRefinements ), "empty" );
  helper.addRefine( facetName, "value1" );
  helper.addRefine( facetName, "value2" );
  helper.addRefine( facetName, "value3" );
  t.ok( _.size( helper.state.facetsRefinements[ facetName ] ) === 3, "Adding another refinement, should have two" );
  helper.removeRefine( facetName, "value2" );
  t.ok( _.size( helper.state.facetsRefinements[ facetName ] ) === 2, "Adding same refinement as the first, should have two" );
  t.deepEqual( helper.state.facetsRefinements[ facetName ], [ "value1", "value3" ], "should contain value1 and value3" );

  t.end();
} );

test( "isDisjunctiveRefined", function( t ) {
  var helper = algoliasearchHelper( null, null, {} );

  var facet = "MyFacet";
  var value = "MyValue";

  t.notOk( helper.isDisjunctiveRefined( facet, value ),
          "isDisjunctiveRefined should not return true for undefined refinement" );
  helper.addDisjunctiveRefine( facet, value );
  t.ok( helper.isDisjunctiveRefined( facet, value ),
        "isDisjunctiveRefined should not return false for defined refinement" );
  helper.removeDisjunctiveRefine( facet, value );
  t.notOk( helper.isDisjunctiveRefined( facet, value ),
         "isDisjunctiveRefined should not return true for removed refinement" );
  t.end();
} );

test( "IsRefined should return true if the ( facet, value ) is refined.", function( t ) {
  var helper = algoliasearchHelper( null, null, {
    facets : [ "facet1" ]
  } );

  helper.addRefine( "facet1", "boom" );

  t.ok( helper.isRefined( "facet1", "boom" ), "the facet + value is refined >> true" );

  t.notOk( helper.isRefined( "facet1", "booohh" ), "value not refined but is a facet" );
  t.notOk( helper.isRefined( "notAFacet", "maoooh" ), "not refined because it's not a facet" );
  t.notOk( helper.isRefined( null, null ), "not even valid values" );

  t.end();
} );

test( "isRefined(facet)/hasRefinements should return true if the facet is refined.", function( t ) {
  var helper = algoliasearchHelper( null, null, {
    facets : [ "facet1" ]
  } );

  t.notOk( helper.isRefined( "facet1" ), "the facet is not refined yet >> false" );
  t.notOk( helper.hasRefinements( "facet1" ), "the facet is not refined yet >> false" );

  helper.addRefine( "facet1", "boom" );

  t.ok( helper.isRefined( "facet1" ), "the facet is refined >> true" );
  t.ok( helper.hasRefinements( "facet1" ), "the facet is refined >> true" );

  t.notOk( helper.isRefined( "notAFacet" ), "not a facet" );
  t.notOk( helper.hasRefinements( "notAFacet" ), "not a facet" );
  t.notOk( helper.isRefined( null ), "not even valid values" );
  t.notOk( helper.hasRefinements( null ), "not even valid values" );

  t.end();
} );
