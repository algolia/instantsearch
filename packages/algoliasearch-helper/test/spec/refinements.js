var test = require("tape");
var _ = require( "lodash" );
var sinon = require("sinon"); 
var algoliasearchHelper = require( "../../index" );

test( "algoliasearchHelper should be initialized with no refinments", function( t ){
  var helper = algoliasearchHelper( {}, "index", {} );
  t.ok( _.isEmpty( helper.refinements ), "helper.refinments should be an empty object");
  t.ok( _.isEmpty( helper.disjunctiveRefinements ), "helper.disjunctiveRefinements should be an empty object");
  t.ok( _.isEmpty( helper.excludes ), "helper.excludes should be an empty object");
  t.end();
} );

test( "Adding refinments should add an entry to the refinments attribute", function( t ) {
  var helper = algoliasearchHelper( {}, "index", {} );
  t.ok( _.isEmpty( helper.refinements ), "should be empty at first");
  helper.addRefine( "facet1", "42" );
  t.ok( _.size( helper.refinements ) === 1 &&
          helper.refinements["facet1:42"] === true,
        "when adding a refinment, should have one");
  helper.addRefine( "facet1", "42" );
  t.ok( _.size( helper.refinements ) === 1, "when adding the same, should still be one");
  helper.removeRefine( "facet1", "42" );
  t.ok( _.size( helper.refinements ) === 1 &&
          helper.refinements["facet1:42"] === false,
        "when removed, should be still one with the value of the key to false");
  t.end();
} );

test( "IsRefined should return true if the ( facet, value ) is refined.", function( t ){
  var helper = algoliasearchHelper( null, null, {} );
  helper.addRefine( "facet1", "boom" );

  t.ok( helper.isRefined( "facet1", "boom" ) );

  t.notOk( helper.isRefined( "facet1", "booohh" ) );
  t.notOk( helper.isRefined( "notAFacet", "maoooh" ) );
  t.notOk( helper.isRefined( null, null ) );

  t.end();
} );
