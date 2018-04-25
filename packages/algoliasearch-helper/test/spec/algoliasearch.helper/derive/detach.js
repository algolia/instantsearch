'use strict';

var test = require('tape');

var algoliasearchHelper = require('../../../../index.js');

test('[Derivated helper] detach a derivative helper', function(t) {
  var client = {
    search: searchTest
  };
  var helper = algoliasearchHelper(client, '');
  var derivedHelper = helper.derive(function(s) { return s; });
  derivedHelper.on('result', function() {});
  helper.search();
  derivedHelper.detach();
  helper.search();


  var nbRequest;
  function searchTest(requests) {
    nbRequest = nbRequest || 0;
    if (nbRequest === 0) {
      t.equal(
        requests.length,
        2,
        'the helper generates a two queries'
      );
      t.deepEqual(
        requests[0],
        requests[1],
        'the helper generates the same query twice'
      );
      t.equal(
        derivedHelper.listeners('result').length,
        1,
        'one listener is plugged to the derived helper'
      );
      nbRequest++;
    } else if (nbRequest === 1) {
      t.equal(
        requests.length,
        1,
        'the helper generates a two queries'
      );
      t.equal(
        derivedHelper.listeners('result').length,
        0,
        'no listener on the derived helper'
      );
      t.end();
    }

    return new Promise(function() {});
  }
});
