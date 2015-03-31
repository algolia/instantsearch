var test = require("tape");
var _ = require( "lodash" );
var sinon = require("sinon");
var algoliaSearch = require( "algoliasearch" );

var Helper = require( "../../index" );

test( "Search should call the algolia client according to the number of refinements", function( t ){
  var testData = require( "./search.testData" );

  var client = algoliaSearch( "dsf", "dsfdf" );

  var mock = sinon.mock( client );
  mock.expects( "startQueriesBatch" ).once();
  mock.expects( "addQueryInBatch" ).exactly( 2 );
  mock.expects( "sendQueriesBatch" ).once().yields( null, testData.response );

  var helper = Helper( client, "test_hotels-node", {
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

test( "all mutating methods should trigger a search", function( t ){
  var helper = Helper( undefined, "Index", {
    disjunctiveFacets : ["city"],
    facets : ["tower"]
  });

  var stubbedSearch = sinon.stub( helper, "_search" );

  helper.search( "" );
  helper.clearRefinements();
  helper.addDisjunctiveRefine( "city", "Paris" );
  helper.removeDisjunctiveRefine( "city", "Paris" );
  helper.addExclude( "tower", "Empire State Building" );
  helper.removeExclude( "tower", "Empire State Building" );
  helper.addRefine( "tower", "Empire State Building" );
  helper.removeRefine( "tower", "Empire State Building" );

  t.equal( stubbedSearch.callCount, 8, "should have triggered calls for each mutating methods");

  t.end();
} );

test( "all mutating methods should not trigger a search if holdSearch flag is passed", function( t ){
  var helper = Helper( undefined, "Index", {
    disjunctiveFacets : ["city"],
    facets : ["tower"]
  });

  var stubbedSearch = sinon.stub( helper, "_search" );

  helper.search( "", true);
  helper.clearRefinements( true );
  helper.addDisjunctiveRefine( "city", "Paris", true );
  helper.removeDisjunctiveRefine( "city", "Paris", true );
  helper.addExclude( "tower", "Empire State Building", true );
  helper.removeExclude( "tower", "Empire State Building", true );
  helper.addRefine( "tower", "Empire State Building", true );
  helper.removeRefine( "tower", "Empire State Building", true );

  t.equal( stubbedSearch.callCount, 0, "should not trigger calls for each mutating methods");

  t.end();
} );
