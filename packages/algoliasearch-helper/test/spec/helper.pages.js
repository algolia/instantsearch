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
  var helper = algoliasearchHelper( "", "", {
    facets : [ "facet1", "f2" ],
    disjunctiveFacets : [ "f1" ]
  } );

  var testMutation = function( tester, text, testFn ) {
    helper.setCurrentPage( 10 );
    t.equal( helper.getCurrentPage(), 10, "set the current page to 10" + text );
    testFn();
    t.equal( helper.getCurrentPage(), 0, "page resetted" + text );
  };

  testMutation( t, " clearRefinements", helper.clearRefinements.bind( helper ) );
  testMutation( t, " setQuery", helper.setQuery.bind( helper, "query" ) );
  testMutation( t, " addNumericRefinement", helper.addNumericRefinement.bind( helper, "facet", ">", "2" ) );
  testMutation( t, " removeNumericRefinement", helper.removeNumericRefinement.bind( helper, "facet", ">" ) );

  testMutation( t, " addExclude", helper.addExclude.bind( helper, "facet1", "val2" ) );
  testMutation( t, " removeExclude", helper.removeExclude.bind( helper, "facet1", "val2" ) );

  testMutation( t, " addRefine", helper.addRefine.bind( helper, "f1", "val" ) );
  testMutation( t, " removeRefine", helper.removeRefine.bind( helper, "f1", "val" ) );

  testMutation( t, " addDisjunctiveRefine", helper.addDisjunctiveRefine.bind( helper, "f2", "val" ) );
  testMutation( t, " removeDisjunctiveRefine", helper.removeDisjunctiveRefine.bind( helper, "f2", "val" ) );

  testMutation( t, " toggleRefine", helper.toggleRefine.bind( helper, "f1", "v1" ) );
  testMutation( t, " toggleExclude", helper.toggleExclude.bind( helper, "facet1", "55" ) );

  t.end();
} );
