"use strict";

var test = require( "tape" );
var algoliasearch = require( "algoliasearch" );
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

test( "Should retrieve different values for multi facetted records", function( t ) {
  var indexName = "helper_refinements";

  setup( indexName, function( client, index ) {
    return index.addObjects( [
                  { facet : [ "f1", "f2" ] },
                  { facet : [ "f1", "f3" ] },
                  { facet : [ "f2", "f3" ] }
                ] )
                .then( function() {
                  return index.setSettings( {
                    attributesToIndex : [ "facet" ],
                    attributesForFaceting : [ "facet" ]
                  } );
                } )
                .then( function( content ) {
                  return index.waitTask( content.taskID );
                } ).then( function() {
                  return client;
                } );
  } ).then( function( client ) {
    var helper = algoliasearchHelper( client, indexName, {
      facets : [ "facet" ]
    } );

    var calls = 0;
    helper.on( "result", function( content ) {
      calls++;
      if( calls === 1 ) {
        t.equal( content.hits.length, 2, "filter should result in two items" );
        t.equal( content.facets[ 0 ].data.f1, 2 );
        t.equal( content.facets[ 0 ].data.f2, 1 );
        t.equal( content.facets[ 0 ].data.f3, 1 );
      }
      if( calls === 2 ) {
        t.equal( content.hits.length, 1, "filter should result in one item" );
        t.equal( content.facets[ 0 ].data.f1, 1 );
        t.equal( content.facets[ 0 ].data.f2, 1 );
        t.end();
      }
    } );

    helper.addRefine( "facet", "f1" ).search();
    helper.addRefine( "facet", "f2" ).search();
  } );

} );
