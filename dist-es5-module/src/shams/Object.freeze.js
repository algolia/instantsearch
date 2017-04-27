'use strict';

// https://github.com/es-shims/es5-shim/blob/bf48788c724f255275a801a371c4a3adc304b34c/es5-sham.js#L473
// Object.freeze is used in various places in our code and is not polyfilled by
// polyfill.io (because not doable): https://github.com/Financial-Times/polyfill-service/issues/232
// So we "sham" it, which means that the API is here but it just returns the object.
if (!Object.freeze) {
  Object.freeze = function freeze(object) {
    if (Object(object) !== object) {
      throw new TypeError('Object.freeze can only be called on Objects.');
    }
    // this is misleading and breaks feature-detection, but
    // allows "securable" code to "gracefully" degrade to working
    // but insecure code.
    return object;
  };
}