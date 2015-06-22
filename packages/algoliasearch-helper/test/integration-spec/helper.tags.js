"use strict";

var test = require( "tape" );
var map = require( "lodash/collection/map" );

var algoliasearchHelper = require( "../../index" );
var setup = require( "../integration-utils.js" ).setup;

test( "[INT][TAGS]Test tags operations on the helper and their results on the algolia API", function( t ) {
  var indexName = "helper_refinements";

  setup( indexName, function( client, index ) {
    return index.addObjects( [
                  { objectID : "0", _tags : [ "t1", "t2" ] },
                  { objectID : "1", _tags : [ "t1", "t3" ] },
                  { objectID : "2", _tags : [ "t2", "t3" ] },
                  { objectID : "3", _tags : [ "t3", "t4" ] }
                ] )
                .then( function( content ) {
                  return index.waitTask( content.taskID );
                } ).then( function() {
                  return client;
                } );
  } ).then( function( client ) {
    var helper = algoliasearchHelper( client, indexName, {} );

    var calls = 0;
    helper.on( "error", function( err ) {
      t.fail( err );
      t.end();
    } );
    helper.on( "result", function( content ) {
      calls++;
      var hitsToParsedID = function( h ) { return parseInt( h.objectID ); };
      if( calls === 1 ) {
        t.equal( content.hits.length, 4, "No tags : 3 results" );
        t.deepEqual( map( content.hits, hitsToParsedID ).sort(),
                     [0, 1, 2, 3],
                     "No tags expected ids : 0, 1, 2, 3" );
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
        t.equal( content.hits.length, 3, "One tag (t3) : 3 results" );
        t.deepEqual( map( content.hits, hitsToParsedID ).sort(),
                    [1, 2, 3],
                    "One tag (t3) expected ids : 1, 2, 3" );
      }
      if( calls === 5 ) {
        t.equal( content.hits.length, 2, "filter should result in two item again" );
        t.deepEqual( map( content.hits, hitsToParsedID ).sort(), [ 1, 2 ] );
        t.end();
      }
    } );

    helper.search();
    helper.addTag( "t1" ).search();
    helper.addTag( "t2" ).search();
    helper.removeTag( "t2" ).toggleTag( "t3" ).toggleTag( "t1" ).search();
    helper.clearTags().setQueryParameter( "tagFilters", "t3,(t1,t2)" ).search();
  } );

} );
