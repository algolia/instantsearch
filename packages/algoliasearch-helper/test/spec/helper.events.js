var test = require("tape");
var _ = require( "lodash" );
var sinon = require("sinon"); 
var algoliaSearchHelper = require( "../../index" );
var optionsDefaults = require( "../../src/algoliasearch.helper" ).optionsDefaults;

test( "Change events should be emitted as soon as the state change (before search)", function( t ){
  var helper = algoliaSearchHelper( undefined, "Index", {
    disjunctiveFacets : ["city"],
    facets : ["tower"]
  });

  var count = 0;
  helper.on( "change", function(){
    count++;
  } );
  var stubbedSearch = sinon.stub( helper, "_search" );

  helper.search( "" );
  t.equal( count, stubbedSearch.callCount, "search");
  
  helper.clearRefinements();
  t.equal( count, stubbedSearch.callCount, "clearRefinements");
  
  helper.addDisjunctiveRefine( "city", "Paris" );
  t.equal( count, stubbedSearch.callCount, "addDisjunctiveRefine" );
  
  helper.removeDisjunctiveRefine( "city", "Paris" );
  t.equal( count, stubbedSearch.callCount, "removeDisjunctiveRefine" );
  
  helper.addExclude( "tower", "Empire State Building" );
  t.equal( count, stubbedSearch.callCount, "addExclude" );
  
  helper.removeExclude( "tower", "Empire State Building" );
  t.equal( count, stubbedSearch.callCount, "removeExclude" );
  
  helper.addRefine( "tower", "Empire State Building" );
  t.equal( count, stubbedSearch.callCount, "addRefine" );

  helper.removeRefine( "tower", "Empire State Building" );
  t.equal( count, stubbedSearch.callCount, "removeRefine" );
   
  t.end();
} );

test( "Change events should be emitted as soon as the state change (before search), even if search is delayed", function( t ){
  var helper = algoliaSearchHelper( undefined, "Index", {
    disjunctiveFacets : ["city"],
    facets : ["tower"]
  });

  var count = 0;
  helper.on( "change", function(){
    count++;
  } );
  var stubbedSearch = sinon.stub( helper, "_search" );

  helper.search( "" , true);
  t.equal( count, 1, "search" );
  t.equal( stubbedSearch.callCount, 0, "search");
  
  helper.clearRefinements( true );
  t.equal( count, 2, "clearRefinements" );
  t.equal( stubbedSearch.callCount, 0, "clearRefinements");
  
  helper.addDisjunctiveRefine( "city", "Paris", true );
  t.equal( count, 3, "addDisjunctiveRefine" );
  t.equal( stubbedSearch.callCount, 0, "addDisjunctiveRefine" );
  
  helper.removeDisjunctiveRefine( "city", "Paris", true );
  t.equal( count, 4, "removeDisjunctiveRefine" );
  t.equal( stubbedSearch.callCount, 0, "removeDisjunctiveRefine" );
  
  helper.addExclude( "tower", "Empire State Building", true );
  t.equal( count, 5, "addExclude" );
  t.equal( stubbedSearch.callCount, 0, "addExclude" );
  
  helper.removeExclude( "tower", "Empire State Building", true );
  t.equal( count, 6, "removeExclude" );
  t.equal( stubbedSearch.callCount, 0, "removeExclude" );
  
  helper.addRefine( "tower", "Empire State Building", true );
  t.equal( count, 7, "addRefine" );
  t.equal( stubbedSearch.callCount, 0, "addRefine" );

  helper.removeRefine( "tower", "Empire State Building", true );
  t.equal( count, 8, "removeRefine" );
  t.equal( stubbedSearch.callCount, 0, "removeRefine" );
   
  t.end();
} );
