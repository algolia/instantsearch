'use strict';

var test = require('tape');
var SearchParameters = require('../../../src/SearchParameters');
var keys = require('lodash/object/keys');
var map = require('lodash/collection/map');
var uniq = require('lodash/array/uniq');
var shortener = require('../../../src/SearchParameters/shortener');

test('Should encode all the properties of AlgoliaSearchHelper properly', function(t) {
  var ks = keys(new SearchParameters());
  var encodedKs = uniq(map(ks, shortener.encode));
  t.equals(
    encodedKs.length,
    ks.length,
    'Once all the properties converted and dedup, their length should be equal'
  );
  var decodedKs = map(encodedKs, shortener.decode);
  t.deepEquals(
    decodedKs,
    ks,
    'Encode then decode should be the initial value'
  );
  t.end();
});
