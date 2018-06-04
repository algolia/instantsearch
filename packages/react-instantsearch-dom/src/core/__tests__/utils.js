import * as utils from '../utils';

describe('utils', () => {
  describe('isSpecialClick', () => {
    it('returns true if a modifier key is pressed', () => {
      expect(utils.isSpecialClick({ altKey: true })).toBe(true);
      expect(utils.isSpecialClick({ ctrlKey: true })).toBe(true);
      expect(utils.isSpecialClick({ metaKey: true })).toBe(true);
      expect(utils.isSpecialClick({ shiftKey: true })).toBe(true);
    });

    it("returns true if it's a middle click", () => {
      expect(utils.isSpecialClick({ button: 1 })).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(utils.isSpecialClick({})).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('capitalizes a string', () => {
      expect(utils.capitalize('oooh spooky')).toBe('Oooh spooky');
    });

    it('works with empty strings', () => {
      expect(utils.capitalize('')).toBe('');
    });
  });
});
