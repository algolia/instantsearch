'use strict';
var test = require('tape');
var algoliaSearchHelper = require('../../index.js');

test('getQueryParameter', function(t) {
  var partial = require('lodash/function/partial');

  var helper = algoliaSearchHelper(null, null, {
    facets: ['facet1'],
    minWordSizefor1Typo: 8,
    ignorePlurals: true
  });

  t.deepEqual(helper.getQueryParameter('facets'), ['facet1']);
  t.equal(helper.getQueryParameter('minWordSizefor1Typo'), 8);
  t.equal(helper.getQueryParameter('ignorePlurals'), true);

  t.throws(partial(helper.getQueryParameter, 'unknown'));

  t.end();
});
