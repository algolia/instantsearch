"use strict";

var random = require( "lodash/number/random" );
var test = require( "tape" );
var algoliasearchHelper = process.browser ? window.algoliasearchHelper : require( "../../" );
var setup = require( "../integration-utils.js" ).setup;

test.skip( "[INT][FILTERS] Should retrieve different values for multi facetted records", function( t ) {
  var indexName = ( process.env.TRAVIS_BUILD_NUMBER ||
    "helper-integration-tests-" ) + "helper_refinements" + random( 0, 5000 );

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
    helper.on( "error", function( err ) {
      t.fail( err );
      t.end();
    } );
    helper.on( "result", function( content ) {
      calls++;
      if( calls === 1 ) {
        t.equal( content.hits.length, 2, "filter should result in two items" );
        t.deepEqual( content.facets[ 0 ].data, {
          f1 : 2,
          f2 : 1,
          f3 : 1
        } );
      }
      if( calls === 2 ) {
        t.equal( content.hits.length, 1, "filter should result in one item" );
        t.deepEqual( content.facets[ 0 ].data, {
          f1 : 1,
          f2 : 1
        } );
      }
      if( calls === 3 ) {
        t.equal( content.hits.length, 0, "filter should result in 0 item" );
        t.equal( content.facets[ 0 ], undefined );
      }
      if( calls === 4 ) {
        t.equal( content.hits.length, 1, "filter should result in one item again" );
        t.deepEqual( content.facets[ 0 ].data, {
          f1 : 1,
          f3 : 1
        } );
        client.deleteIndex( indexName );
        t.end();

      }
    } );

    helper.addRefine( "facet", "f1" ).search();
    helper.addRefine( "facet", "f2" ).search();
    helper.toggleRefine( "facet", "f3" ).search();
    helper.removeRefine( "facet", "f2" ).search();
  } );
} );
