import { reverseHighlightedParts } from '../reverseHighlightedParts';

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
      // The ` - ` separator sits between two siblings that share the same
      // (reversed) highlight state, so it adopts that state to keep the
      // highlight contiguous. This previously stayed `false` because of a
      // `|| true` sibling default that collapsed any `false` neighbor to
      // `true`; see `getHighlightFromSiblings`.
      { isHighlighted: true, value: ' - ' },
      { isHighlighted: true, value: 'Black' },
    ]);
  });
});
