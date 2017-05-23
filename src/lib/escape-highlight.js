import reduce from 'lodash/reduce';
import escape from 'lodash/escape';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import mapValues from 'lodash/mapValues';

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
  return reduce(input, (output, value, key) => {
    if (typeof value.value === 'string') {
      value.value = replaceWithEmAndEscape(value.value);
    }

    if (isPlainObject(value.value)) {
      value.value = mapValues(value.value, replaceWithEmAndEscape);
    }

    if (isArray(value.value)) {
      value.value = value.value.map(replaceWithEmAndEscape);
    }

    return {...output, [key]: value};
  }, {});
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
