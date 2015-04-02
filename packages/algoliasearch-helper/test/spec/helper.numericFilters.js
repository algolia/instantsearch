var test = require("tape");
var _ = require( "lodash" );
var sinon = require("sinon"); 
var algoliaSearch = require( "algoliasearch" );
var algoliasearchHelper = require( "../../index" );

test( "Numeric filters : numeric filters from constructor", function( t ){
  var client = algoliaSearch( "dsf", "dsfdf" );
  client.sendQueriesBatch = function(){ /*Do nothing*/ };
  client.addQueryInBatch = function( i, q, args ) {
    t.equals( args.numericFilters[ 0 ], "attribute1>3" );
    t.equals( args.numericFilters[ 1 ], "attribute1<=100" );
    t.equals( args.numericFilters[ 2 ], "attribute2=42" );

    t.end();
  }

  var helper = algoliasearchHelper( client, "index", {                            
    numericRefinements : {
      "attribute1" : {
        ">" : 3,
        "<=" : 100
      },
      "attribute2" : {
        "=": 42
      }
    }
  } );
  helper.search();
} );

test( "Numeric filters : numeric filters from setters", function( t ){
  var client = algoliaSearch( "dsf", "dsfdf" );
  client.sendQueriesBatch = function(){ /*Do nothing*/ };
  client.addQueryInBatch = function( i, q, args ) {
    t.equals( args.numericFilters[ 0 ], "badassAttribute>9000" );
    t.equals( args.numericFilters[ 1 ], "attribute2!=7" );
    t.end();
  }

  var helper = algoliasearchHelper( client, "index" );
  helper.addNumericRefinement( "badassAttribute", ">", 9000, true );
  helper.addNumericRefinement( "attribute2", "!=", "7", true );

  helper.search();
} );
