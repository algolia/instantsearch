'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');

var _ = require('lodash');

var fakeClient = {};

test('helper.hasRefinements(attribute)', function(t) {
  var helper;

  // cannot be tested since there's no way to know that a numeric refinement
  // was once added then removed thus we always return false when not found
  t.skip('undefined attribute', function(tt) {
    setup();
    tt.throws(_.partial(helper.hasRefinements, 'unknown'), Error, 'it throws when unknown attribute');
    tt.end();
  });

  t.test('numericRefinement', function(tt) {
    tt.test('with refinement', function(ttt) {
      setup();
      helper.addNumericRefinement('price', '=', 1337);
      ttt.equal(helper.hasRefinements('price'), true);
      ttt.end();
    });

    tt.test('without refinement', function(ttt) {
      setup();
      helper.addNumericRefinement('price', '=', 1337);
      helper.clearRefinements('price');
      ttt.equal(helper.hasRefinements('price'), false);
      ttt.end();
    });
  });

  t.test('facet', function(tt) {
    tt.test('with refinement', function(ttt) {
      setup({
        facets: ['color']
      });
      helper.toggleFacetRefinement('color', 'red');
      ttt.equal(helper.hasRefinements('color'), true);
      ttt.end();
    });

    tt.test('without refinement', function(ttt) {
      setup({
        facets: ['color']
      });
      ttt.equal(helper.hasRefinements('color'), false);
      ttt.end();
    });
  });

  t.test('disjunctiveFacet', function(tt) {
    tt.test('with refinement', function(ttt) {
      setup({
        disjunctiveFacets: ['author']
      });
      helper.toggleFacetRefinement('author', 'John Spartan');
      ttt.equal(helper.hasRefinements('author'), true);
      ttt.end();
    });

    tt.test('without refinement', function(ttt) {
      setup({
        disjunctiveFacets: ['author']
      });
      ttt.equal(helper.hasRefinements('author'), false);
      ttt.end();
    });
  });

  t.test('hierarchicalFacet', function(tt) {
    tt.test('with refinement', function(ttt) {
      setup({
        hierarchicalFacets: [{
          name: 'category',
          attributes: ['category.lvl0', 'category.lvl1']
        }]
      });
      helper.toggleFacetRefinement('category', 'Action Movies > Max');
      ttt.equal(helper.hasRefinements('category'), true);
      ttt.end();
    });

    tt.test('without refinement', function(ttt) {
      setup({
        hierarchicalFacets: [{
          name: 'category',
          attributes: ['category.lvl0', 'category.lvl1']
        }]
      });
      ttt.equal(helper.hasRefinements('category'), false);
      ttt.end();
    });
  });

  function setup(params) {
    helper = algoliasearchHelper(fakeClient, 'index', params);
  }
});
