import reverseHighlightedParts from '../reverseHighlightedParts';

describe('reverseHighlightedParts', () => {
  test('returns reversed HighlightedParts with a single match', () => {
    expect(
      reverseHighlightedParts([
        { isHighlighted: false, value: 'Amazon' },
        {
          isHighlighted: true,
          value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black',
        },
      ])
    ).toEqual([
      { isHighlighted: true, value: 'Amazon' },
      {
        isHighlighted: false,
        value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black',
      },
    ]);
  });

  test('with reversed HighlightedParts with multiple matches', () => {
    expect(
      reverseHighlightedParts([
        { isHighlighted: false, value: 'Amazon' },
        {
          isHighlighted: true,
          value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-',
        },
        { isHighlighted: false, value: 'Fi' },
        { isHighlighted: false, value: ' - ' },
        { isHighlighted: false, value: 'Black' },
      ])
    ).toEqual([
      { isHighlighted: true, value: 'Amazon' },
      {
        isHighlighted: false,
        value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-',
      },
      { isHighlighted: true, value: 'Fi' },
      { isHighlighted: false, value: ' - ' },
      { isHighlighted: true, value: 'Black' },
    ]);
  });
});
