import { noop } from './noop';

type WarnCache = {
  current: Record<string, boolean>;
};

export const warnCache: WarnCache = {
  current: {},
};

type Warn = (message: string) => void;

type Warning = (condition: boolean, message: string) => void;

/**
 * Logs a warning when this function is called, in development environment only.
 */
let deprecate = <TCallback extends (...args: any[]) => any>(
  fn: TCallback,
  // @ts-ignore this parameter is used in the __DEV__ branch
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  message: string
) => fn;

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
  warn = (message) => {
    // eslint-disable-next-line no-console
    console.warn(`[InstantSearch]: ${message.trim()}`);
  };

  deprecate = (fn, message) => {
    let hasAlreadyPrinted = false;

    return function (...args) {
      if (!hasAlreadyPrinted) {
        hasAlreadyPrinted = true;

        warn(message);
      }

      return fn(...args);
    } as typeof fn;
  };

  warning = ((condition, message) => {
    if (condition) {
      return;
    }

    const hasAlreadyPrinted = warnCache.current[message];

    if (!hasAlreadyPrinted) {
      warnCache.current[message] = true;

      warn(message);
    }
  }) as Warning;
}

export { deprecate, warning };
