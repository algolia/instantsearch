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

describe('getHighlightFromSiblings', () => {
  test('returns the isHighlighted value with a missing sibling', () => {
    expect(getHighlightFromSiblings(oneMatch, 0)).toEqual(true);
  });

  test('returns the isHighlighted value with both siblings', () => {
    expect(getHighlightFromSiblings(multipleMatches, 1)).toEqual(true);
  });

  test('adopts the shared state of present non-highlighted siblings', () => {
    // A non-alphanumeric separator between two non-highlighted siblings adopts
    // their `false` state. This used to collapse to `true` because of a
    // `|| true` default that treated any `false` neighbor as highlighted.
    const parts: HighlightedParts[] = [
      { isHighlighted: false, value: 'Fi' },
      { isHighlighted: false, value: ' - ' },
      { isHighlighted: false, value: 'Black' },
    ];

    expect(getHighlightFromSiblings(parts, 1)).toEqual(false);
  });

  test('defaults a missing sibling to highlighted', () => {
    const parts: HighlightedParts[] = [{ isHighlighted: false, value: ' - ' }];

    expect(getHighlightFromSiblings(parts, 0)).toEqual(true);
  });

  test('keeps its own state when siblings disagree', () => {
    const parts: HighlightedParts[] = [
      { isHighlighted: true, value: 'a' },
      { isHighlighted: false, value: ' - ' },
      { isHighlighted: false, value: 'b' },
    ];

    expect(getHighlightFromSiblings(parts, 1)).toEqual(false);
  });
});
