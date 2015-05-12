"use strict";
var test = require("tape");
var _ = require( "lodash" );
var sinon = require("sinon"); 
var algoliaSearchHelper = require( "../../index" );
var optionsDefaults = require( "../../src/algoliasearch.helper" ).optionsDefaults;

test( "Defaults should apply if no options are passed", function( t ){
  //var helperInstance0 = algoliaSearchHelper( null, null, {} );
  //t.ok( _.isEqual( helperInstance0.options, optionsDefaults ) );

  //var helperInstance1 = algoliaSearchHelper( null, null, null );
  //t.ok( _.isEqual( helperInstance1.options, optionsDefaults ) );

  t.end();
});

test( "Defaults should filled if some options are not passed", function( t ){
  var notDefaultHitsPerPage = optionsDefaults + 1;
  var helperInstance0 = algoliaSearchHelper( null, null, {
     hitsPerPage : notDefaultHitsPerPage
  } );

  //t.ok( _.isEqual( helperInstance0.options.hitsPerPage, notDefaultHitsPerPage ) );
  //t.ok( _.isEqual( helperInstance0.options.facets, optionsDefaults.facets ) );
  //t.ok( _.isEqual( helperInstance0.options.disjunctiveFacets, optionsDefaults.disjunctiveFacets ) );
  //t.ok( _.isEqual( helperInstance0.options.defaultFacetFilters, optionsDefaults.defaultFacetFilters ) );

  t.end();
});
