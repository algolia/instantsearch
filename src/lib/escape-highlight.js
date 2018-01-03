import reduce from 'lodash/reduce';
import escape from 'lodash/escape';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';

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
  return reduce(
    input,
    (output, attribute, key) => {
      if (typeof attribute.value === 'string') {
        attribute.value = replaceWithEmAndEscape(attribute.value);
      }

      if (isPlainObject(attribute)) {
        attribute = recursiveEscape(attribute);
      }

      if (isArray(attribute)) {
        attribute = attribute.map(item => ({
          ...item,
          value: replaceWithEmAndEscape(item.value),
        }));
      }

      return {
        ...output,
        [key]: attribute,
      };
    },
    {}
  );
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
