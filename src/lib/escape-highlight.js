import reduce from 'lodash/reduce';
import escape from 'lodash/escape';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';

export const tagConfig = {
  highlightPreTag: '__ais-highlight__',
  highlightPostTag: '__/ais-highlight__',
};

function replaceWithEmAndEscape(value) {
  return escape(value)
    .replace(new RegExp(tagConfig.highlightPreTag, 'g'), '<em>')
    .replace(new RegExp(tagConfig.highlightPostTag, 'g'), '</em>');
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
    value: replaceWithEmAndEscape(input.value),
  };
}

export default function escapeHits(hits) {
  if (hits.__escaped === undefined) {
    hits.__escaped = true;

    return hits.map(hit => {
      if (hit._highlightResult) {
        hit._highlightResult = recursiveEscape(hit._highlightResult);
      }

      if (hit._snippetResult) {
        hit._snippetResult = recursiveEscape(hit._snippetResult);
      }

      return hit;
    });
  }

  return hits;
}

export function escapeFacets(facetHits) {
  return facetHits.map(h => ({
    ...h,
    highlighted: replaceWithEmAndEscape(h.highlighted),
  }));
}
