'use strict';

var algoliasearchHelper = require('../../../../');

test('[derived helper] detach a derived helper', function (done) {
  var client = {
    search: searchTest,
  };
  var helper = algoliasearchHelper(client, 'indexName');
  var derivedHelper = helper.derive(function (s) {
    return s;
  });
  derivedHelper.on('result', function () {});
  helper.search();
  derivedHelper.detach();
  helper.search();

  var nbRequest;
  function searchTest(requests) {
    nbRequest = nbRequest || 0;
    if (nbRequest === 0) {
      expect(requests.length).toBe(2);
      expect(requests[0]).toEqual(requests[1]);
      expect(derivedHelper.listeners('result').length).toBe(1);
      nbRequest++;
    } else if (nbRequest === 1) {
      expect(requests.length).toBe(1);
      expect(derivedHelper.listeners('result').length).toBe(0);
      done();
    }

    return new Promise(function () {});
  }
});
