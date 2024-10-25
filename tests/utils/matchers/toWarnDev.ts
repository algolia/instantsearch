/* eslint-disable no-console */

import { diff } from 'jest-diff';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Matchers<R> {
      toWarnDev: (expectedMessage?: string) => R;
    }
  }
}

function runCallback(
  callback: () => void | Promise<void>,
  getValue: () => jest.CustomMatcherResult
) {
  const maybePromise = callback();

  if (maybePromise?.then) {
    return Promise.resolve(maybePromise).then(() => getValue());
  }

  return getValue();
}

export const toWarnDev: jest.CustomMatcher = (
  callback: () => void | Promise<void>,
  expectedMessage: string
) => {
  if (expectedMessage !== undefined && typeof expectedMessage !== 'string') {
    throw new Error(
      `toWarnDev() requires a parameter of type string but was given ${typeof expectedMessage}.`
    );
  }

  if (!__DEV__) {
    return runCallback(callback, () => ({
      pass: true,
      message: () => 'Not in dev mode, so no warnings get triggered.',
    }));
  }

  const originalWarnMethod = console.warn;
  let calledTimes = 0;
  let actualWarning = '';

  console.warn = (message: string) => {
    calledTimes++;
    actualWarning = message;
  };

  return runCallback(callback, () => {
    console.warn = originalWarnMethod;

    // Expectation without any message.
    // We only check that `console.warn` was called.
    if (expectedMessage === undefined && calledTimes === 0) {
      return {
        pass: false,
        message: () => 'No warning recorded.',
      };
    }

    if (!actualWarning) {
      return {
        pass: false,
        message: () => 'No warning recorded.',
      };
    }

    // Expectation with a message.
    if (expectedMessage !== undefined && actualWarning !== expectedMessage) {
      return {
        pass: false,
        message: () => `Unexpected warning recorded.

Difference:

${diff(expectedMessage, actualWarning)}`,
      };
    }

    return {
      pass: true,
      message: () => `Warning was triggered:

${actualWarning}`,
    };
  });
};
