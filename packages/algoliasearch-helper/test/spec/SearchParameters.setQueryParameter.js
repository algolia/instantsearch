"use strict";
var test = require( "tape" );
//var _ = require( "lodash" );
var SearchParameters = require( "../../src/SearchParameters" );

test( "setqueryparameter should update existing parameter", function( t ) {
  var sp = new SearchParameters( {
    facets : ["facet"]
  } );

  var newValue = [];
  var newsp = sp.setQueryParameter( "facets", newValue );

  t.equal( newsp.facets, newValue, "update of an existing parameter" );

  t.end();
} );

test( "setqueryparameter should add non-existing parameter", function( t ) {
  var sp = new SearchParameters( {
    facets : ["facet"]
  } );

  var newValue = [ "attributesToHighlight" ];
  var newsp = sp.setQueryParameter( "attributesToHighlight", newValue );

  t.equal( newsp.attributesToHighlight, newValue, "add new parameter" );

  t.end();
} );

test( "setQueryParameter should not create a new instance if the update is non effective", function( t ) {
  var sp = new SearchParameters( {
    facets : ["facet"],
    maxValuesPerFacet : 10
  } );

  var newValue = 10;
  var newsp = sp.setQueryParameter( "maxValuesPerFacet", newValue );

  t.equal( newsp, sp, "No change should result in the same instance" );

  t.end();
} );

test( "setQueryParameter should not create a new instance if the parameter is unknown", function( t ) {
  var sp = new SearchParameters( {
    facets : ["facet"]
  } );

  var newValue = [ "attributesToHighlight" ];
  var newsp = sp.setQueryParameter( "unknown", newValue );

  t.equal( newsp, sp, "Unknown parameter should return the same instance" );

  t.end();
} );
