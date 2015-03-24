var test = require("tape");
var _ = require( "lodash" );
var sinon = require("sinon"); 
var algoliasearchHelper = require( "../../index" );

test( "addExclude should add an exclusion", function( t ){
  var helper = new algoliasearchHelper( null, null, null );
  var facetName = "facet";
  var facetValueToExclude = "brand";
  var refinement = facetName + ":-" + facetValueToExclude;

  t.notOk( helper.excludes[ refinement ] );
  helper.addExclude( facetName, facetValueToExclude );
  t.ok( helper.excludes[ refinement ] );

  t.end();
});

test( "removeExclude should remove an exclusion", function( t ){
  var helper = new algoliasearchHelper( null, null, null );
  var facetName = "facet";
  var facetValueToExclude = "brand";
  var refinement = facetName + ":-" + facetValueToExclude;

  helper.addExclude( facetName, facetValueToExclude );
  t.ok( helper.excludes[ refinement ] );
  helper.removeExclude( facetName, facetValueToExclude );
  t.notOk( helper.excludes[ refinement ] );

  t.end();
});

test( "isExcluded should report exclusion correctly", function( t ){
  var helper = new algoliasearchHelper( null, null, null );
  var facetName = "facet";
  var facetValueToExclude = "brand";

  t.notOk( helper.isExcluded( facetName, facetValueToExclude ) );
  helper.addExclude( facetName, facetValueToExclude );
  t.ok( helper.isExcluded( facetName, facetValueToExclude ) );
  helper.removeExclude( facetName, facetValueToExclude );
  t.notOk( helper.isExcluded( facetName, facetValueToExclude ) );

  t.end();
});
