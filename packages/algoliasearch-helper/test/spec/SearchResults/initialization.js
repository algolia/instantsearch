'use strict';

var SearchParameters = require('../../../src/SearchParameters');
var SearchResults = require('../../../src/SearchResults');

test('processingTime should be the sum of all individual times', function () {
  var result = new SearchResults(new SearchParameters(), [
    {
      processingTimeMS: 1,
    },
    {
      processingTimeMS: 1,
    },
  ]);

  expect(result.processingTimeMS).toBe(2);
});

test('processingTime should ignore undefined', function () {
  var result = new SearchResults(new SearchParameters(), [
    {
      processingTimeMS: undefined,
    },
    {
      processingTimeMS: 1,
    },
  ]);

  expect(result.processingTimeMS).toBe(1);
});

test('options should override search result keys', function () {
  var result = new SearchResults(
    new SearchParameters(),
    [
      {
        __isArtificial: false,
      },
    ],
    {
      __isArtificial: true,
    }
  );

  expect(result.__isArtificial).toBe(true);
});
