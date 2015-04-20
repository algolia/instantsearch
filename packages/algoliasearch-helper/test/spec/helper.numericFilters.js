"use strict";
var test = require( "tape" );
var algoliaSearch = require( "algoliasearch" );
var algoliasearchHelper = require( "../../index" );

test( "Numeric filters : numeric filters from constructor", function( t ) {
  var client = algoliaSearch( "dsf", "dsfdf" );
  client.search = function( queries ) {
    var ps = queries[0].params;
    t.equals( ps.numericFilters[ 0 ], "attribute1>3" );
    t.equals( ps.numericFilters[ 1 ], "attribute1<=100" );
    t.equals( ps.numericFilters[ 2 ], "attribute2=42" );
    t.end();
  };

  var helper = algoliasearchHelper( client, "index", {
    numericRefinements : {
      "attribute1" : {
        ">" : 3,
        "<=" : 100
      },
      "attribute2" : {
        "=" : 42
      }
    }
  } );
  helper.search();
} );

test( "Numeric filters : numeric filters from setters", function( t ) {
  var client = algoliaSearch( "dsf", "dsfdf" );
  client.search = function( queries ) {
    var ps = queries[0].params;
    t.equals( ps.numericFilters[ 0 ], "badassAttribute>9000" );
    t.equals( ps.numericFilters[ 1 ], "attribute2!=7" );
    t.end();
  };

  var helper = algoliasearchHelper( client, "index" );
  helper.addNumericRefinement( "badassAttribute", ">", 9000, true );
  helper.addNumericRefinement( "attribute2", "!=", "7", true );

  helper.search();
} );

test( "Should be able to remove a value if it equals 0", function( t ) {
  var helper = algoliasearchHelper( null, null, null );

  helper.addNumericRefinement( "attribute", ">", 0 );
  t.equal( helper.state.numericRefinements.attribute[ ">" ], 0, "should be set to 0 initially" );
  helper.removeNumericRefinement( "attribute", ">", 0 );
  t.equal( helper.state.numericRefinements.attribute, undefined, "should set to undefined" );
  t.end();
} );
