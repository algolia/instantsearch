import getHighlightedParts from '../getHighlightedParts';

const oneMatch =
  '<mark>Amazon</mark> - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black';

const multipleMatches =
  '<mark>Amazon</mark> - Fire HD8 - 8&quot; - <mark>Tablet</mark> - 16GB - Wi-Fi - Black';

describe('getHighlightedParts', () => {
  test('returns an HighlightParts array of object from a string with a single match', () => {
    expect(getHighlightedParts(oneMatch)).toEqual([
      { isHighlighted: true, value: 'Amazon' },
      {
        isHighlighted: false,
        value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black',
      },
    ]);
  });

  test('returns an HighlightedParts array of object from a string with multiple matches', () => {
    expect(getHighlightedParts(multipleMatches)).toEqual([
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
