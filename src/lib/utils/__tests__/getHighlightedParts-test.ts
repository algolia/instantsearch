import getHighlightedParts from '../getHighlightedParts';

describe('getHighlightedParts', () => {
  test('returns an HighlightParts array of object from a string with a single match', () => {
    expect(
      getHighlightedParts(
        '<mark>Amazon</mark> - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black'
      )
    ).toEqual([
      { isHighlighted: true, value: 'Amazon' },
      {
        isHighlighted: false,
        value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black',
      },
    ]);
  });

  test('returns an HighlightedParts array of object from a string with multiple matches', () => {
    expect(
      getHighlightedParts(
        '<mark>Amazon</mark> - Fire HD8 - 8&quot; - <mark>Tablet</mark> - 16GB - Wi-Fi - Black'
      )
    ).toEqual([
      { isHighlighted: true, value: 'Amazon' },
      {
        isHighlighted: false,
        value: ' - Fire HD8 - 8&quot; - ',
      },
      {
        isHighlighted: true,
        value: 'Tablet',
      },
      {
        isHighlighted: false,
        value: ' - 16GB - Wi-Fi - Black',
      },
    ]);
  });
});
