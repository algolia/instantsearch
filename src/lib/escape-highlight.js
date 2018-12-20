import reduce from 'lodash/reduce';
import escape from 'lodash/escape';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';

export const TAG_PLACEHOLDER = {
  highlightPreTag: '__ais-highlight__',
  highlightPostTag: '__/ais-highlight__',
};

export const TAG_REPLACEMENT = {
  highlightPreTag: '<mark>',
  highlightPostTag: '</mark>',
};

function replaceTagsAndEscape(value) {
  return escape(value)
    .replace(
      new RegExp(TAG_PLACEHOLDER.highlightPreTag, 'g'),
      TAG_REPLACEMENT.highlightPreTag
    )
    .replace(
      new RegExp(TAG_PLACEHOLDER.highlightPostTag, 'g'),
      TAG_REPLACEMENT.highlightPostTag
    );
}

function recursiveEscape(input) {
  if (isPlainObject(input) && typeof input.value !== 'string') {
    return reduce(
      input,
      (acc, item, key) => ({
        ...acc,
        [key]: recursiveEscape(item),
      }),
      {}
    );
  }

  if (isArray(input)) {
    return input.map(recursiveEscape);
  }

  return {
    ...input,
    value: replaceTagsAndEscape(input.value),
  };
}

export default function escapeHits(hits) {
  if (hits.__escaped === undefined) {
    hits = hits.map(hit => {
      if (hit._highlightResult) {
        hit._highlightResult = recursiveEscape(hit._highlightResult);
      }

      if (hit._snippetResult) {
        hit._snippetResult = recursiveEscape(hit._snippetResult);
      }

      return hit;
    });
    hits.__escaped = true;
  }

  return hits;
}

export function escapeFacets(facetHits) {
  return facetHits.map(h => ({
    ...h,
    highlighted: replaceTagsAndEscape(h.highlighted),
  }));
}
