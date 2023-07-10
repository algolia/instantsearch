'use strict';

function inherits(ctor, superCtor) {
  // eslint-disable-next-line no-param-reassign
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
}

module.exports = inherits;
