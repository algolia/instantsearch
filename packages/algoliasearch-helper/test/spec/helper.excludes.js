var test = require("tape");
var _ = require( "lodash" );
var sinon = require("sinon"); 
var algoliasearchHelper = require( "../../index" );

test( "addExclude should add an exclusion", function( t ){
  var helper = new algoliasearchHelper( null, null, null );
  helper._search = function(){};
  var facetName = "facet";
  var facetValueToExclude = "brand";

  t.notOk( helper.state.facetsExcludes[ facetName ], "initialy empty");
  helper.addExclude( facetName, facetValueToExclude );
  t.ok( helper.state.facetsExcludes[ facetName ], "not empty");
  t.ok( helper.state.facetsExcludes[ facetName ][  0 ] === facetValueToExclude, "with the correct value");

  t.end();
});

test( "removeExclude should remove an exclusion", function( t ){
  var helper = new algoliasearchHelper( null, null, null );
  helper._search = function(){};
  var facetName = "facet";
  var facetValueToExclude = "brand";
  var refinement = facetName + ":-" + facetValueToExclude;

  helper.addExclude( facetName, facetValueToExclude );
  t.ok( helper.state.facetsExcludes[ facetName ].length === 1, "not empty at first");
  helper.removeExclude( facetName, facetValueToExclude );
  t.ok( helper.state.facetsExcludes[ facetName ].length === 0, "then empty" );

  try{ 
    helper.removeExclude( facetName, facetValueToExclude );
  }
  catch ( e ){
    t.fail( "Removing unset exclusions should be ok..." ); 
  }

  t.end();
});

test( "isExcluded should report exclusion correctly", function( t ){
  var helper = new algoliasearchHelper( null, null, null );
  helper._search = function(){};
  var facetName = "facet";
  var facetValueToExclude = "brand";

  t.notOk( helper.isExcluded( facetName, facetValueToExclude ), "value not exclude at first" );
  helper.addExclude( facetName, facetValueToExclude );
  t.ok( helper.isExcluded( facetName, facetValueToExclude ), "value is excluded");
  helper.removeExclude( facetName, facetValueToExclude );
  t.notOk( helper.isExcluded( facetName, facetValueToExclude ), "value is not excluded anymore");

  t.end();
});
