import type { HighlightedParts } from '../../types/index.js';
import { TAG_REPLACEMENT } from './escape-highlight.js';

export default function concatHighlightedParts(parts: HighlightedParts[]) {
  const { highlightPreTag, highlightPostTag } = TAG_REPLACEMENT;

  return parts
    .map((part) =>
      part.isHighlighted
        ? highlightPreTag + part.value + highlightPostTag
        : part.value
    )
    .join('');
}
