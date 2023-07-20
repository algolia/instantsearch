'use strict';

jest.retryTimes(3, { logErrorsBeforeRetry: true });

var utils = require('../../test/integration-utils');
var setup = utils.setupSimple;
var createIndexName = utils.createIndexName;

var algoliasearchHelper = require('../../');

var indexName = createIndexName('helper_highlight');

var dataset = [
  { facet: ['f1', 'f2'] },
  { facet: ['f1', 'f3'] },
  { facet: ['f2', 'f3'] },
];

var config = {
  attributesToIndex: ['facet'],
  attributesForFaceting: ['facet'],
};

var client;
beforeAll(function () {
  return setup(indexName, dataset, config).then(function (c) {
    client = c;
  });
});

test('[INT][HIGHLIGHT] The highlight should be consistent with the parameters', function (done) {
  var helper = algoliasearchHelper(client, indexName, {
    attributesToHighlight: ['facet'],
    facets: ['facet'],
  });

  var calls = 0;
  helper.on('result', function (event) {
    calls++;
    if (calls === 1) {
      expect(event.results.hits[0]._highlightResult.facet[0].value).toBe(
        '<em>f1</em>'
      );
      expect(event.results.hits[1]._highlightResult.facet[0].value).toBe(
        '<em>f1</em>'
      );
      helper
        .setQueryParameter('highlightPostTag', '</strong>')
        .setQueryParameter('highlightPreTag', '<strong>')
        .search();
    } else if (calls === 2) {
      expect(event.results.hits[0]._highlightResult.facet[0].value).toBe(
        '<strong>f1</strong>'
      );
      expect(event.results.hits[1]._highlightResult.facet[0].value).toBe(
        '<strong>f1</strong>'
      );
      client.deleteIndex(indexName);
      if (!process.browser) {
        client.destroy();
      }
      done();
    }
  });

  helper.setQuery('f1').search();
});
