var test = require("tape");
var _ = require( "lodash" );
var sinon = require("sinon"); 
var algoliasearchHelper = require( "../../index" );

test( "setChange should change the current page", function( t ){
  var helper = new algoliasearchHelper( null, null, null );
  helper._search = function(){};

  t.ok( helper.getCurrentPage() === 0, "First page should be 0" );
  helper.setPage( 3 );
  t.ok( helper.getCurrentPage() === 3, "If page was changed to 3, getCurrentPage should return 3" );
  t.end();
} );

test( "nextPage should increment the page by one", function( t ){
  var helper = new algoliasearchHelper( null, null, null );
  helper._search = function(){};

  t.ok( helper.getCurrentPage() === 0, "First page should be 0" );
  helper.nextPage();
  helper.nextPage();
  helper.nextPage();
  t.ok( helper.getCurrentPage() === 3, "If page was increment 3 times, getCurrentPage should return 3" );
  t.end();
} );

test( "previousPage should decrement the current page by one", function( t ){
  var helper = new algoliasearchHelper( null, null, null );
  helper._search = function(){};

  t.ok( helper.getCurrentPage() === 0, "First page should be 0" );
  helper.setPage( 3 );
  t.ok( helper.getCurrentPage() === 3, "If page was changed to 3, getCurrentPage should return 3" );
  helper.previousPage();
  t.ok( helper.getCurrentPage() === 2, "must be 2 now" );
  t.end();
} );
