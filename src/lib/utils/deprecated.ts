import noop from './noop';

type Deprecated = (callback: Function, message?: string) => void;

let deprecated: Deprecated = noop;
const cache = {};

if (__KEEP_DEPRECATION__) {
  deprecated = (callback, message) => {
    if (message && !cache[message]) {
      cache[message] = true;
      console.warn(`[InstantSearch.js]: ${message.trim()}`);
    }
    callback();
  };
}

export { deprecated };
