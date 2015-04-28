"use strict";

var test = require("tape");
var sinon = require("sinon");
var algoliaSearch = require( "algoliasearch" );

var algoliasearchHelper = require( "../../index" );

test( "Search should call the algolia client according to the number of refinements", function( t ){
  var testData = require( "./search.testdata" );

  var client = algoliaSearch( "dsf", "dsfdf" );

  var mock = sinon.mock( client );
  mock.expects( "search" ).once().yields( null, testData.response );

  var helper = algoliasearchHelper( client, "test_hotels-node", {
    disjunctiveFacets : ["city"]
  });

  helper.addDisjunctiveRefine( "city", "Paris", true );
  helper.addDisjunctiveRefine( "city", "New York", true);

  helper.on( "result", function( data ) {
    t.deepEqual( data, testData.responseHelper,  "should be equal" );
    t.ok( mock.verify(), "Mock constraints should be verified!" );
    t.end();
  } );

  helper.search( "" );
} );

test( "no mutating methods should trigger a search", function( t ){
  var helper = algoliasearchHelper( undefined, "Index", {
    disjunctiveFacets : ["city"],
    facets : ["tower"]
  });

  var stubbedSearch = sinon.stub( helper, "_search" );

  helper.setQuery( "" );
  helper.clearRefinements();
  helper.addDisjunctiveRefine( "city", "Paris" );
  helper.removeDisjunctiveRefine( "city", "Paris" );
  helper.addExclude( "tower", "Empire State Building" );
  helper.removeExclude( "tower", "Empire State Building" );
  helper.addRefine( "tower", "Empire State Building" );
  helper.removeRefine( "tower", "Empire State Building" );

  t.equal( stubbedSearch.callCount, 0, "should not have triggered calls");

  helper.search();

  t.equal( stubbedSearch.callCount, 1, "should have triggered a single search");

  t.end();
} );
