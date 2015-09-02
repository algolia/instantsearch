'use strict';

var test = require('tape');

// Can be activated in V3, right now we only console.error
test.skip('it throws when providing an unknown parameter', function(t) {
  t.plan(1);

  var algoliasearchHelper = require('../../');

  try {
    algoliasearchHelper({}, 'unknown-parameter', {
      IDoNotExistsInRealLife: 'Do you?'
    });
  } catch (e) {
    t.equal(e.message, 'Unsupported SearchParameter: `IDoNotExistsInRealLife`');
  }
});
