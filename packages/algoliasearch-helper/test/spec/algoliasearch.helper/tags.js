'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');
var requestBuilder = require('../../../src/requestBuilder');

var fakeClient = {};

test('Tag filters: operations on tags list', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);

  helper.addTag('tag').addTag('tag2');
  t.deepEqual(helper.getTags(), ['tag', 'tag2'], 'should be [ tag, tag2 ]');
  helper.removeTag('tag');
  t.deepEqual(helper.getTags(), ['tag2'], 'should be [ tag2 ]');
  helper.toggleTag('tag3').toggleTag('tag2').toggleTag('tag4');
  t.deepEqual(helper.getTags(), ['tag3', 'tag4'], 'should be [ tag3, tag4 ]');
  t.end();
});

test('Tags filters: advanced query', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);

  var complexQuery = '(sea, city), romantic, -mountain';

  helper.setQueryParameter('tagFilters', complexQuery);

  t.deepEqual(requestBuilder._getTagFilters(helper.state), complexQuery, 'The complex query should be equal to the user input');

  t.end();
});

test('Tags filters: switching between advanced and simple API should be forbidden without clearing the refinements first', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);

  helper.addTag('tag').addTag('tag2');
  t.deepEqual(requestBuilder._getTagFilters(helper.state), 'tag,tag2', 'should be [ tag, tag2 ]');

  var complexQuery = '(sea, city), romantic, -mountain';

  try {
    helper.setQueryParameter('tagFilters', complexQuery);
    t.fail("Can't switch directly from the advanced API to the managed API");
  } catch (e0) {
    helper.clearTags().setQueryParameter('tagFilters', complexQuery);
    t.deepEqual(requestBuilder._getTagFilters(helper.state), complexQuery, 'The complex should override the simple mode if cleared before');

    try {
      helper.addTag('tag').addTag('tag2');
      t.fail("Can't switch directly from the managed API to the advanced API");
    } catch (e1) {
      helper.setQueryParameter('tagFilters', undefined).addTag('tag').addTag('tag2');
      t.deepEqual(requestBuilder._getTagFilters(helper.state), 'tag,tag2', 'should be [ tag, tag2 ]');

      t.end();
    }
  }
});
