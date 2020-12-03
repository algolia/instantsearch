import { HighlightedParts } from '../../../types';
import reverseHighlightedParts from '../reverseHighlightedParts';

const oneMatch: HighlightedParts[] = [
  { isHighlighted: false, value: 'Amazon' },
  {
    isHighlighted: true,
    value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black',
  },
];

const multipleMatches: HighlightedParts[] = [
  { isHighlighted: false, value: 'Amazon' },
  { isHighlighted: true, value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-' },
  { isHighlighted: false, value: 'Fi' },
  { isHighlighted: false, value: ' - ' },
  { isHighlighted: false, value: 'Black' },
];

describe('reverseHighlightedParts', () => {
  test('returns reversed HighlightedParts with a single match', () => {
    expect(reverseHighlightedParts(oneMatch)).toEqual([
      { isHighlighted: true, value: 'Amazon' },
      {
        isHighlighted: false,
        value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black',
      },
    ]);
  });

  test('with reversed HighlightedParts with multiple matches', () => {
    expect(reverseHighlightedParts(multipleMatches)).toEqual([
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
