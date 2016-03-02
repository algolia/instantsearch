/* eslint-disable */

// FIX IE <= 10 babel6:
// - https://phabricator.babeljs.io/T3041
// - https://phabricator.babeljs.io/T3041#70671
var testObject = {};

if (!(Object.setPrototypeOf || testObject.__proto__)) {
  var nativeGetPrototypeOf = Object.getPrototypeOf;

  Object.getPrototypeOf = function(object) {
    if (object.__proto__) {
      return object.__proto__;
    } else {
      return nativeGetPrototypeOf.call(Object, object);
    }
  }
}
