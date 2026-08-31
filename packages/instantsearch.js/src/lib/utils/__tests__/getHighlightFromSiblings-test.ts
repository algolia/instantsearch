import { getHighlightFromSiblings } from '../getHighlightFromSiblings';

import type { HighlightedParts } from '../../../types';

const oneMatch: HighlightedParts[] = [
  { isHighlighted: true, value: 'Amazon' },
  {
    isHighlighted: false,
    value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-Fi - Black',
  },
];

const multipleMatches: HighlightedParts[] = [
  { isHighlighted: false, value: 'Amazon' },
  {
    isHighlighted: true,
    value: ' - Fire HD8 - 8&quot; - Tablet - 16GB - Wi-',
  },
  { isHighlighted: false, value: 'Fi' },
  { isHighlighted: false, value: ' - ' },
  { isHighlighted: false, value: 'Black' },
];

const siblingsDisagree: HighlightedParts[] = [
  { isHighlighted: true, value: 'Amazon' },
  { isHighlighted: false, value: ' - ' },
  { isHighlighted: false, value: 'Fire' },
];

describe('getHighlightFromSiblings', () => {
  test('returns the isHighlighted value with a missing sibling', () => {
    expect(getHighlightFromSiblings(oneMatch, 0)).toEqual(true);
  });

  test('returns the isHighlighted value with both siblings', () => {
    expect(getHighlightFromSiblings(multipleMatches, 1)).toEqual(true);
  });

  test('keeps the separator state when siblings disagree', () => {
    // The separator sits between a highlighted and a non-highlighted part, so
    // it must keep its own state instead of inheriting from siblings. With the
    // previous `|| true` the neighbors collapsed to `true === true` and the
    // separator was wrongly reported as highlighted.
    expect(getHighlightFromSiblings(siblingsDisagree, 1)).toEqual(false);
  });
});
