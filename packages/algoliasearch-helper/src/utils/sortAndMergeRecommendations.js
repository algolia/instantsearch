'use strict';

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
    var resultIndex = results.findIndex(function (hits) {
      return Boolean(
        hits.find(function (hit) {
          return hit.objectID === avgIndexRef.objectID;
        })
      );
    });
    if (resultIndex === -1) return orderedHits;

    var result = results[resultIndex].find(function (hit) {
      return hit.objectID === avgIndexRef.objectID;
    });
    var queryID = queryIDs && queryIDs[resultIndex];

    // Copied so the cached response isn't mutated.
    return orderedHits.concat(
      queryID ? Object.assign({}, result, { __queryID: queryID }) : result
    );
  }, []);

  return finalOrder;
}

module.exports = sortAndMergeRecommendations;
