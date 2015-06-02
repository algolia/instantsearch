"use strict";
var test = require( "tape" );
var SearchParameters = require( "../../src/SearchParameters" );

test( "setQueryParameters should be able to mix an actual state with a new set of parameters", function( t ) {
  var originalSP = new SearchParameters( {
    facets : [ "a", "b" ],
    ignorePlurals : false,
    attributesToHighlight : ""
  } );

  var params = {
    facets : [ "a", "c" ],
    attributesToHighlight : [ "city", "country" ],
    replaceSynonymsInHighlight : true
  };
  var newSP = originalSP.setQueryParameters( params );

  t.equal( newSP.facets, params.facets, "Facets should be updated (existing parameter)" );
  t.equal( newSP.attributesToHighlight, newSP.attributesToHighlight, "attributesToHighlight should be updated (existing parameter)" );
  t.equal( newSP.replaceSynonymsInHighlight, newSP.replaceSynonymsInHighlight, "replaceSynonymsInHighlight should be updated (new parameter)" );
  t.equal( newSP.ignorePlurals, originalSP.ignorePlurals, "ignorePlurals should be the same as the original" );

  t.end();
} );

test( "setQueryParameters should not add unknown properties", function( t ) {
  var originalSP = new SearchParameters( {
    facets : [ "a", "b" ],
    ignorePlurals : false,
    attributesToHighlight : ""
  } );

  var params = {
    unknow1 : [ "a", "c" ],
    facet : [ "city", "country" ]
  };

  t.throws( originalSP.setQueryParameters.bind( originalSP, params ),
            "The new searchParameters should be strictly equal" );

  t.end();
} );
