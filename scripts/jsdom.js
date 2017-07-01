
beforeEach(function () {
  this.jsdom = require('jsdom-global')();
});

afterEach(function () {
  this.jsdom();
});
