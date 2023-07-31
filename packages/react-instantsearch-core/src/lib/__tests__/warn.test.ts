/* eslint-disable no-console */

import { warn } from '../warn';

describe('warn', () => {
  if (__DEV__) {
    test('logs when the condition is unmet', () => {
      expect(() => {
        warn(false, 'warning');
      }).toWarnDev('[InstantSearch] warning');
    });

    test('does not log when the condition is met', () => {
      expect(() => {
        warn(true, 'warning');
      }).not.toWarnDev();
    });

    test('trims the message', () => {
      expect(() => {
        warn(false, '\nwarning! ');
      }).toWarnDev('[InstantSearch] warning!');
    });

    test('warns a message a single time', () => {
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn();

      warn(false, 'warning1');
      warn(false, 'warning1');
      warn(false, 'warning2');

      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenNthCalledWith(
        1,
        '[InstantSearch] warning1'
      );
      expect(console.warn).toHaveBeenNthCalledWith(
        2,
        '[InstantSearch] warning2'
      );

      console.warn = originalConsoleWarn;
    });
  }
});
