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

  helper.addDisjunctiveRefine( "city", "Paris" );
  helper.addDisjunctiveRefine( "city", "New York" );

  helper.on( "result", function( data ) {
    t.ok( _.isEqual( data, testData.responseHelper ) , "should be equal" );
    t.ok( mock.verify(), "" );
    t.end();
  } );

  helper.search( "" );
} );
