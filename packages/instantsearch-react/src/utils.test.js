/* eslint-env jest, jasmine */

import {
  isSpecialClick,
  capitalize,
} from './utils';
jest.unmock('./utils');

describe('utils', () => {
  describe('isSpecialClick', () => {
    it('returns true if a modifier key is pressed', () => {
      expect(isSpecialClick({altKey: true})).toBe(true);
      expect(isSpecialClick({ctrlKey: true})).toBe(true);
      expect(isSpecialClick({metaKey: true})).toBe(true);
      expect(isSpecialClick({shiftKey: true})).toBe(true);
    });

    it('returns true if it\'s a middle click', () => {
      expect(isSpecialClick({button: 1})).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(isSpecialClick({})).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('capitalizes a string', () => {
      expect(capitalize('oooh spooky')).toBe('Oooh spooky');
    });

    it('works with empty strings', () => {
      expect(capitalize('')).toBe('');
    });
  });
});
