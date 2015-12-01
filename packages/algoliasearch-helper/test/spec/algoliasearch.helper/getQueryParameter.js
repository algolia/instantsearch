'use strict';

var test = require('tape');
var algoliaSearchHelper = require('../../../index.js');

test('getQueryParameter', function(t) {
  var bind = require('lodash/function/bind');

  var helper = algoliaSearchHelper(null, null, {
    facets: ['facet1'],
    minWordSizefor1Typo: 8,
    ignorePlurals: true
  });

  t.deepEqual(helper.getQueryParameter('facets'), ['facet1']);
  t.equal(helper.getQueryParameter('minWordSizefor1Typo'), 8);
  t.equal(helper.getQueryParameter('ignorePlurals'), true);

  t.throws(bind(helper.getQueryParameter, helper, 'unknown'));

  t.end();
});
