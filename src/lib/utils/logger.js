import noop from './noop';

let deprecate = noop;
let warn = noop;

/**
 * Logs a warning if the condition is not met.
 * This is used to log issues in development environment only.
 *
 * @returns {undefined}
 */
let warning = noop;

if (__DEV__) {
  warn = message => {
    // eslint-disable-next-line no-console
    console.warn(`[InstantSearch.js]: ${message.trim()}`);
  };

  deprecate = (fn, message) => {
    let hasAlreadyPrinted = false;

    return function(...args) {
      if (!hasAlreadyPrinted) {
        hasAlreadyPrinted = true;

        warn(message);
      }

      return fn(...args);
    };
  };

  warning = (condition, message) => {
    if (condition) {
      return;
    }

    const hasAlreadyPrinted = warning.cache[message];

    if (!hasAlreadyPrinted) {
      warning.cache[message] = true;

      warn(message);
    }
  };

  warning.cache = {};
}

export { warn, deprecate, warning };
