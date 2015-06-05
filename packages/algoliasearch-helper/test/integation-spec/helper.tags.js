"use strict";

var test = require( "tape" );
var algoliasearch = require( "algoliasearch" );
var map = require( "lodash/collection/map" );

var algoliasearchHelper = require( "../../index" );

function setup( indexName, fn ) {
  var appID = process.env.INTEGRATION_TEST_APPID;
  var key = process.env.INTEGRATION_TEST_API_KEY;

  var client = algoliasearch( appID, key, { protocol : "https:" } );
  return client.deleteIndex( indexName )
               .then( function( ) {
                 var index = client.initIndex( indexName );
                 return fn( client, index );
               } );
}

test( "Test tags operations on the helper and their results on the algolia API", function( t ) {
  var indexName = "helper_refinements";

  setup( indexName, function( client, index ) {
    return index.addObjects( [
                  { objectID : "0", _tags : [ "t1", "t2" ] },
                  { objectID : "1", _tags : [ "t1", "t3" ] },
                  { objectID : "2", _tags : [ "t2", "t3" ] }
                ] )
                .then( function( content ) {
                  return index.waitTask( content.taskID );
                } ).then( function() {
                  return client;
                } );
  } ).then( function( client ) {
    var helper = algoliasearchHelper( client, indexName, {} );

    var calls = 0;
    helper.on( "result", function( content, state ) {
      calls++;
      var hitsToParsedID = function( h ) { return parseInt( h.objectID ); };
      if( calls === 1 ) {
        t.equal( content.hits.length, 3, "No tags : 3 results" );
        t.deepEqual( map( content.hits, hitsToParsedID ).sort(),
                     [0, 1, 2],
                     "No tags expected ids : 0, 1, 2" );
      }
      if( calls === 2 ) {
        t.equal( content.hits.length, 2, "One tag (t1) : 2 results" );
        t.deepEqual( map( content.hits, hitsToParsedID ).sort(),
                     [0, 1],
                     "One tag (t1) expected ids : 0, 1" );
      }
      if( calls === 3 ) {
        t.equal( content.hits.length, 1, "Two tags (t1, t2) : 1 result" );
        t.deepEqual( map( content.hits, hitsToParsedID ).sort(),
                     [0],
                     "Two tags (t1, t2) expected ids : 0" );
      }
      if( calls === 4 ) {
        t.equal( content.hits.length, 2, "One tag (t3) : 2 result" );
        t.deepEqual( map( content.hits, hitsToParsedID ).sort(),
                    [1, 2],
                    "One tag (t3) expected ids : 1, 2 " );
        t.end();
      }
    } );

    helper.search();
    helper.addTag( "t1" ).search();
    helper.addTag( "t2" ).search();
    helper.removeTag( "t2" ).toggleTag( "t3" ).toggleTag( "t1" ).search();
  } );

} );
