import { TAG_REPLACEMENT } from './escape-highlight';

import type { HighlightedParts } from '../../types';

export function concatHighlightedParts(parts: HighlightedParts[]) {
  const { highlightPreTag, highlightPostTag } = TAG_REPLACEMENT;

  return parts
    .map((part) =>
      part.isHighlighted
        ? highlightPreTag + part.value + highlightPostTag
        : part.value
    )
    .join('');
}
