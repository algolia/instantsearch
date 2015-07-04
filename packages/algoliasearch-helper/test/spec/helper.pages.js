"use strict";
var test = require( "tape" );
var algoliasearchHelper = require( "../../index" );

test( "setChange should change the current page", function( t ) {
  var helper = algoliasearchHelper( null, null, null );

  t.ok( helper.getCurrentPage() === 0, "First page should be 0" );
  helper.setCurrentPage( 3 );
  t.ok( helper.getCurrentPage() === 3, "If page was changed to 3, getCurrentPage should return 3" );
  t.end();
} );

test( "nextPage should increment the page by one", function( t ) {
  var helper = algoliasearchHelper( null, null, null );

  t.ok( helper.getCurrentPage() === 0, "First page should be 0" );
  helper.nextPage();
  helper.nextPage();
  helper.nextPage();
  t.ok( helper.getCurrentPage() === 3, "If page was increment 3 times, getCurrentPage should return 3" );
  t.end();
} );

test( "previousPage should decrement the current page by one", function( t ) {
  var helper = algoliasearchHelper( null, null, null );

  t.ok( helper.getCurrentPage() === 0, "First page should be 0" );
  helper.setCurrentPage( 3 );
  t.ok( helper.getCurrentPage() === 3, "If page was changed to 3, getCurrentPage should return 3" );
  helper.previousPage();
  t.ok( helper.getCurrentPage() === 2, "must be 2 now" );
  t.end();
} );

test( "pages should be reset if the mutation might change the number of pages", function( t ) {
  var bindAll = require( "lodash/function/bindAll" );
  var partial = require( "lodash/function/partial" );

  var helper = algoliasearchHelper( "", "", {
    facets : [ "facet1", "f2" ],
    disjunctiveFacets : [ "f1" ]
  } );

  bindAll(helper);

  var testMutation = function( tester, text, testFn ) {
    helper.setCurrentPage( 10 );
    t.equal( helper.getCurrentPage(), 10, "set the current page to 10" + text );
    testFn();
    t.equal( helper.getCurrentPage(), 0, "page resetted" + text );
  };

  testMutation( t, " clearRefinements", helper.clearRefinements );
  testMutation( t, " setQuery", partial( helper.setQuery, "query" ) );
  testMutation( t, " addNumericRefinement", partial( helper.addNumericRefinement, "facet", ">", "2" ) );
  testMutation( t, " removeNumericRefinement", partial( helper.removeNumericRefinement, "facet", ">" ) );

  testMutation( t, " addExclude", partial( helper.addExclude, "facet1", "val2" ) );
  testMutation( t, " removeExclude", partial( helper.removeExclude, "facet1", "val2" ) );

  testMutation( t, " addRefine", partial( helper.addRefine, "f1", "val" ) );
  testMutation( t, " removeRefine", partial( helper.removeRefine, "f1", "val" ) );

  testMutation( t, " addDisjunctiveRefine", partial( helper.addDisjunctiveRefine, "f2", "val" ) );
  testMutation( t, " removeDisjunctiveRefine", partial( helper.removeDisjunctiveRefine, "f2", "val" ) );

  testMutation( t, " toggleRefine", partial( helper.toggleRefine, "f1", "v1" ) );
  testMutation( t, " toggleExclude", partial( helper.toggleExclude, "facet1", "55" ) );

  t.end();
} );
