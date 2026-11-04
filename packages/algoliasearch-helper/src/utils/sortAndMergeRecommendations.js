'use strict';

var find = require('../functions/find');
var findIndex = require('../functions/findIndex');

function getAverageIndices(indexTracker, nrOfObjs) {
  var avgIndices = [];

  Object.keys(indexTracker).forEach(function (key) {
    if (indexTracker[key].count < 2) {
      indexTracker[key].indexSum += 100;
    }
    avgIndices.push({
      objectID: key,
      avgOfIndices: indexTracker[key].indexSum / nrOfObjs,
    });
  });

  return avgIndices.sort(function (a, b) {
    return a.avgOfIndices > b.avgOfIndices ? 1 : -1;
  });
}

/**
 * @param {string[]} objectIDs source objectIDs, excluded from the merged list
 * @param {Array<Array<object>>} results hits of each response
 * @param {Array<string|undefined>} [queryIDs] queryID of each response, same order as `results`
 */
function sortAndMergeRecommendations(objectIDs, results, queryIDs) {
  var indexTracker = {};

  results.forEach(function (hits) {
    hits.forEach(function (hit, index) {
      if (objectIDs.includes(hit.objectID)) return;

      if (!indexTracker[hit.objectID]) {
        indexTracker[hit.objectID] = { indexSum: index, count: 1 };
      } else {
        indexTracker[hit.objectID] = {
          indexSum: indexTracker[hit.objectID].indexSum + index,
          count: indexTracker[hit.objectID].count + 1,
        };
      }
    });
  });

  var sortedAverageIndices = getAverageIndices(indexTracker, results.length);

  var finalOrder = sortedAverageIndices.reduce(function (
    orderedHits,
    avgIndexRef
  ) {
    var resultIndex = findIndex(results, function (hits) {
      return Boolean(
        find(hits, function (hit) {
          return hit.objectID === avgIndexRef.objectID;
        })
      );
    });
    if (resultIndex === -1) return orderedHits;

    var result = find(results[resultIndex], function (hit) {
      return hit.objectID === avgIndexRef.objectID;
    });
    var queryID = queryIDs && queryIDs[resultIndex];

    // Each response has its own queryID: a merged hit must keep the one of the
    // response it comes from, or insights events get attributed to the wrong
    // request. Copied so the cached response stays untouched.
    return orderedHits.concat(
      queryID ? Object.assign({}, result, { __queryID: queryID }) : result
    );
  }, []);

  return finalOrder;
}

module.exports = sortAndMergeRecommendations;
