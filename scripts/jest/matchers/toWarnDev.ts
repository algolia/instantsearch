/* eslint-disable no-console, no-redeclare */
/*
 * The `no-redeclare` rule sends a false positive with
 * an incompatibility with TypeScript namespaces.
 * See: https://github.com/typescript-eslint/typescript-eslint/issues/60
 */

import jestDiff from 'jest-diff';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/generic-type-naming
    interface Matchers<R> {
      toWarnDev(expectedMessage?: string): CustomMatcherResult;
    }
  }
}

const matcher: jest.ExpectExtendMap = {
  toWarnDev: (callback: () => void, expectedMessage: string) => {
    if (expectedMessage !== undefined && typeof expectedMessage !== 'string') {
      throw new Error(
        `toWarnDev() requires a parameter of type string but was given ${typeof expectedMessage}.`
      );
    }

    if (!__DEV__) {
      callback();

      return { pass: true, message: '' };
    }

    const originalWarnMethod = console.warn;
    let calledTimes = 0;
    let actualWarning = '';

    console.warn = (message: string) => {
      calledTimes++;
      actualWarning = message;
    };

    callback();

    console.warn = originalWarnMethod;

    // Expectation without any message.
    // We only check that `console.warn` was called.
    if (expectedMessage === undefined && calledTimes === 0) {
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

${jestDiff(expectedMessage, actualWarning)}`,
      };
    }

    return { pass: true, message: '' };
  },
};

export default matcher;
