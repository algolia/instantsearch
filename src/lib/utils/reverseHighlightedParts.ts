import type { HighlightedParts } from '../../types/index.js';
import getHighlightFromSiblings from './getHighlightFromSiblings.js';

export default function reverseHighlightedParts(parts: HighlightedParts[]) {
  if (!parts.some((part) => part.isHighlighted)) {
    return parts.map((part) => ({ ...part, isHighlighted: false }));
  }

  return parts.map((part, i) => ({
    ...part,
    isHighlighted: !getHighlightFromSiblings(parts, i),
  }));
}
