import noop from './noop';

type Deprecate<TCallback = (...args: any[]) => any> = (
  fn: TCallback,
  message: string
) => TCallback | void;
let deprecate: Deprecate = noop;

type Warn = (message: string) => void;
let warn: Warn = noop;

type Warning = {
  (condition: boolean, message: string): void;
  cache: object;
};
/**
 * Logs a warning if the condition is not met.
 * This is used to log issues in development environment only.
 *
 * @returns {undefined}
 */
let warning = noop as Warning;
warning.cache = {};

if (__DEV__) {
  warn = message => {
    // eslint-disable-next-line no-console
    console.warn(`[InstantSearch.js]: ${message.trim()}`);
  };

  deprecate = (fn: (...args: any[]) => any, message: string) => {
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
