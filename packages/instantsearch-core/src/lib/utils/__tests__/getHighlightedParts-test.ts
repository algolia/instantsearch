import { getHighlightedParts } from '../getHighlightedParts';

describe('getHighlightedParts', () => {
  test('returns an HighlightParts array of object from a string with a single match', () => {
    expect(
      getHighlightedParts(
        '__ais-highlight__Amazon__/ais-highlight__ - Fire HD8 - 8" - Tablet - 16GB - Wi-Fi - Black'
      )
    ).toEqual([
      { isHighlighted: true, value: 'Amazon' },
      {
        isHighlighted: false,
        value: ' - Fire HD8 - 8" - Tablet - 16GB - Wi-Fi - Black',
      },
    ]);
  });

  test('returns an HighlightedParts array of object from a string with multiple matches', () => {
    expect(
      getHighlightedParts(
        '__ais-highlight__Amazon__/ais-highlight__ - Fire HD8 - 8" - __ais-highlight__Tablet__/ais-highlight__ - 16GB - Wi-Fi - Black'
      )
    ).toEqual([
      { isHighlighted: true, value: 'Amazon' },
      {
        isHighlighted: false,
        value: ' - Fire HD8 - 8" - ',
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

  test('does not treat HTML tags from the record as highlights', () => {
    expect(
      getHighlightedParts(
        '<mark>a</mark> __ais-highlight__b__/ais-highlight__ <script>c</script>'
      )
    ).toEqual([
      { isHighlighted: false, value: '<mark>a</mark> ' },
      { isHighlighted: true, value: 'b' },
      { isHighlighted: false, value: ' <script>c</script>' },
    ]);
  });
});
