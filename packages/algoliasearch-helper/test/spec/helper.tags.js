"use strict";
var test = require( "tape" );
var algoliasearchHelper = require( "../../index" );

test( "Tag filters : operations on tags list", function( t ) {
  var helper = algoliasearchHelper( null, null, null );
  helper.addTag( "tag" ).addTag( "tag2" );
  t.deepEqual( helper.getTags(), [ "tag", "tag2" ], "should be [ tag, tag2 ]" );
  helper.removeTag( "tag" );
  t.deepEqual( helper.getTags(), [ "tag2" ], "should be [ tag2 ]" );
  helper.toggleTag( "tag3" ).toggleTag( "tag2" ).toggleTag( "tag4" );
  t.deepEqual( helper.getTags(), [ "tag3", "tag4" ], "should be [ tag3, tag4 ]" );
  t.end();
} );

test( "Tags filters : advanced query", function( t ) {
  var helper = algoliasearchHelper( null, null, null );

  var complexQuery = "( sea, city ), romantic, -mountain";
  helper.setQueryParameter( "tagFilters", complexQuery );

  t.deepEqual( helper._getTagFilters(), complexQuery, "The complex query should be equal to the user input" );

  t.end();
} );

test( "Tags filters : switching betweend advanced and simple API", function( t ) {
  var helper = algoliasearchHelper( null, null, null );

  helper.addTag( "tag" ).addTag( "tag2" );
  t.deepEqual( helper._getTagFilters(), "tag,tag2", "should be [ tag, tag2 ]" );

  var complexQuery = "( sea, city ), romantic, -mountain";
  helper.setQueryParameter( "tagFilters", complexQuery );

  t.deepEqual( helper._getTagFilters(), complexQuery, "The complex should override the simple mode" );

  helper.addTag( "tag" ).addTag( "tag2" );
  t.deepEqual( helper._getTagFilters(), "tag,tag2", "should be [ tag, tag2 ]" );

  t.end();
} );
