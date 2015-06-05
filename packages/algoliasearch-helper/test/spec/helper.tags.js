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

