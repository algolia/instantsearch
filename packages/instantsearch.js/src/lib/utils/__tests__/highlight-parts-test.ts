import {
  concatHighlightedParts,
  getHighlightedParts,
} from '../highlight-parts';

describe('highlight-parts', () => {
  describe('round trip', () => {
    test.each([
      '<mark>Amazon</mark> - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black',
      '<mark>Amazon</mark> - Fire HD8 - 8&quot; - <mark>Tablet</mark> - 16GB - Wi-Fi - Black',
      '<mark>Amazon</mark>',
      'no highlight here',
    ])('concat(get(%p)) returns the original string', (value) => {
      expect(concatHighlightedParts(getHighlightedParts(value))).toEqual(value);
    });
  });
});
