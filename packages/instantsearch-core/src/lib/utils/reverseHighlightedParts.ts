import { getHighlightFromSiblings } from './getHighlightFromSiblings';

import type { HighlightedParts } from '../../types';

export function reverseHighlightedParts(parts: HighlightedParts[]) {
  if (!parts.some((part) => part.isHighlighted)) {
    return parts.map((part) => ({ ...part, isHighlighted: false }));
  }

  return parts.map((part, i) => ({
    ...part,
    isHighlighted: !getHighlightFromSiblings(parts, i),
  }));
}
