import { HighlightedParts } from '../../../types';
import concatHighlightedParts from '../concatHighlightedParts';

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

describe('concatHighlightedParts', () => {
  test('returns a concatenated string from HighlightedParts with a single match', () => {
    expect(concatHighlightedParts(oneMatch)).toMatchInlineSnapshot(
      `"Amazon<mark> - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black</mark>"`
    );
  });

  test('returns a concatenated string from HighlightedParts with multiple matches', () => {
    expect(concatHighlightedParts(multipleMatches)).toMatchInlineSnapshot(
      `"Amazon<mark> - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-</mark>Fi - Black"`
    );
  });
});
