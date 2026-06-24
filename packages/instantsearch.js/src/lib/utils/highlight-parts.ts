import { unescape } from './escape-html';
import { TAG_REPLACEMENT } from './escape-highlight';

import type { HighlightedParts } from '../../types';

const hasAlphanumeric = new RegExp(/\w/i);

/**
 * Parses an Algolia highlighted string into an array of parts, where each part
 * is flagged as highlighted or not. This is the inverse of
 * `concatHighlightedParts`.
 */
export function getHighlightedParts(highlightedValue: string) {
  // @MAJOR: this should use TAG_PLACEHOLDER
  const { highlightPostTag, highlightPreTag } = TAG_REPLACEMENT;

  const splitByPreTag = highlightedValue.split(highlightPreTag);
  const firstValue = splitByPreTag.shift();
  const elements = !firstValue
    ? []
    : [{ value: firstValue, isHighlighted: false }];

  splitByPreTag.forEach((split) => {
    const splitByPostTag = split.split(highlightPostTag);

    elements.push({
      value: splitByPostTag[0],
      isHighlighted: true,
    });

    if (splitByPostTag[1] !== '') {
      elements.push({
        value: splitByPostTag[1],
        isHighlighted: false,
      });
    }
  });

  return elements;
}

/**
 * Re-serializes highlighted parts into an Algolia highlighted string. This is
 * the inverse of `getHighlightedParts`.
 */
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

/**
 * Resolves the effective highlight state of a part by looking at its siblings.
 * A non-alphanumeric part (e.g. a separator) surrounded by two parts that share
 * the same highlight state adopts that state, so reversed highlighting stays
 * contiguous across separators. A missing sibling defaults to highlighted.
 */
export function getHighlightFromSiblings(parts: HighlightedParts[], i: number) {
  const current = parts[i];
  const isNextHighlighted = parts[i + 1]?.isHighlighted ?? true;
  const isPreviousHighlighted = parts[i - 1]?.isHighlighted ?? true;

  if (
    !hasAlphanumeric.test(unescape(current.value)) &&
    isPreviousHighlighted === isNextHighlighted
  ) {
    return isPreviousHighlighted;
  }

  return current.isHighlighted;
}

/**
 * Inverts the highlight state of each part, keeping separators contiguous with
 * their siblings via `getHighlightFromSiblings`.
 */
export function reverseHighlightedParts(parts: HighlightedParts[]) {
  if (!parts.some((part) => part.isHighlighted)) {
    return parts.map((part) => ({ ...part, isHighlighted: false }));
  }

  return parts.map((part, i) => ({
    ...part,
    isHighlighted: !getHighlightFromSiblings(parts, i),
  }));
}
