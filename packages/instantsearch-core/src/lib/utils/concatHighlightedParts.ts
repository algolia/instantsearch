import { TAG_PLACEHOLDER } from './escape-highlight';

import type { HighlightedParts } from '../../types';

export function concatHighlightedParts(parts: HighlightedParts[]) {
  const { highlightPreTag, highlightPostTag } = TAG_PLACEHOLDER;

  return parts
    .map((part) =>
      part.isHighlighted
        ? highlightPreTag + part.value + highlightPostTag
        : part.value
    )
    .join('');
}
