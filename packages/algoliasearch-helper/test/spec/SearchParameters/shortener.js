'use strict';

var SearchParameters = require('../../../src/SearchParameters');
var keys = require('lodash/keys');
var map = require('lodash/map');
var uniq = require('lodash/uniq');
var shortener = require('../../../src/SearchParameters/shortener');

test('Should encode all the properties of AlgoliaSearchHelper properly', function() {
  var ks = keys(new SearchParameters());
  var encodedKs = uniq(map(ks, shortener.encode));
  expect(encodedKs.length).toBe(ks.length);
  var decodedKs = map(encodedKs, shortener.decode);
  expect(decodedKs).toEqual(ks);
});
