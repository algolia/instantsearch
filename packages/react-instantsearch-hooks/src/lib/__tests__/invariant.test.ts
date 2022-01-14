import { invariant } from '../invariant';

describe('invariant', () => {
  if (!__DEV__) {
    test('throws a generic invariant violation in production', () => {
      expect(() => {
        invariant(false, 'invariant');
      }).toThrow('Invariant failed');
    });

    test('does not throw when the condition is met in production', () => {
      expect(() => {
        invariant(true, 'invariant');
      }).not.toThrow();
    });
  }

  if (__DEV__) {
    test('throws when the condition is unmet', () => {
      expect(() => {
        invariant(false, 'invariant');
      }).toThrow('[InstantSearch] invariant');
    });

    test('does not throw when the condition is met', () => {
      expect(() => {
        invariant(true, 'invariant');
      }).not.toThrow();
    });

    test('lazily instantiates message', () => {
      const spy1 = jest.fn(() => 'invariant');
      const spy2 = jest.fn(() => 'invariant');

      expect(() => {
        invariant(false, spy1);
      }).toThrow('[InstantSearch] invariant');

      expect(spy1).toHaveBeenCalledTimes(1);

      expect(() => {
        invariant(true, spy2);
      }).not.toThrow('[InstantSearch] invariant');

      expect(spy2).not.toHaveBeenCalled();
    });
  }
});
