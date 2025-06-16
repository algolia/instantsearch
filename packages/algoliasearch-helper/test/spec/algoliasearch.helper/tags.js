'use strict';

var algoliasearchHelper = require('../../../index');
var requestBuilder = require('../../../src/requestBuilder');

var fakeClient = {};

test('Tag filters: operations on tags list', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  helper.addTag('tag').addTag('tag2');
  expect(helper.getTags()).toEqual(['tag', 'tag2']);
  helper.removeTag('tag');
  expect(helper.getTags()).toEqual(['tag2']);
  helper.toggleTag('tag3').toggleTag('tag2').toggleTag('tag4');
  expect(helper.getTags()).toEqual(['tag3', 'tag4']);
});

test('Tags filters: advanced query', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  var complexQuery = '(sea, city), romantic, -mountain';

  helper.setQueryParameter('tagFilters', complexQuery);

  expect(requestBuilder._getTagFilters(helper.state)).toEqual(complexQuery);
});

test('Tags filters: switching between advanced and simple API should be forbidden without clearing the refinements first', function (done) {
  var helper = algoliasearchHelper(fakeClient, null, null);

  helper.addTag('tag').addTag('tag2');
  expect(requestBuilder._getTagFilters(helper.state)).toEqual('tag,tag2');

  var complexQuery = '(sea, city), romantic, -mountain';

  try {
    helper.setQueryParameter('tagFilters', complexQuery);
    done(
      new Error(
        "Can't switch directly from the advanced API to the managed API"
      )
    );
  } catch (e0) {
    helper.clearTags().setQueryParameter('tagFilters', complexQuery);
    expect(requestBuilder._getTagFilters(helper.state)).toEqual(complexQuery);
  }

  try {
    helper.addTag('tag').addTag('tag2');
    done(
      new Error(
        "Can't switch directly from the managed API to the advanced API"
      )
    );
  } catch (e1) {
    helper
      .setQueryParameter('tagFilters', undefined)
      .addTag('tag')
      .addTag('tag2');
    expect(requestBuilder._getTagFilters(helper.state)).toEqual('tag,tag2');
  }

  done();
});
