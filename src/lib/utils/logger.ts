import noop from './noop';

type Deprecate<TCallback = (...args: any[]) => any> = (
  fn: TCallback,
  message: string
) => TCallback;

type Warn = (message: string) => void;

type Warning = {
  (condition: boolean, message: string): void;
  cache: { [message: string]: boolean };
};

/**
 * Logs a warning when this function is called, in development environment only.
 */
let deprecate: Deprecate = fn => fn;

/**
 * Logs a warning
 * This is used to log issues in development environment only.
 */
let warn: Warn = noop;

/**
 * Logs a warning if the condition is not met.
 * This is used to log issues in development environment only.
 */
let warning = noop as Warning;

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

  warning = ((condition, message) => {
    if (condition) {
      return;
    }

    const hasAlreadyPrinted = warning.cache[message];

    if (!hasAlreadyPrinted) {
      warning.cache[message] = true;

      warn(message);
    }
  }) as Warning;

  warning.cache = {};
}

export { warn, deprecate, warning };
