// copied from React InstantSearch
import { getPropertyByPath } from 'instantsearch.js/es/lib/utils';
import { unescape } from '../util/unescape';

const TAG_PLACEHOLDER = {
  highlightPreTag: '__ais-highlight__',
  highlightPostTag: '__/ais-highlight__',
};

/**
 * Parses an highlighted attribute into an array of objects with the string value, and
 * a boolean that indicated if this part is highlighted.
 *
 * @param {string} preTag - string used to identify the start of an highlighted value
 * @param {string} postTag - string used to identify the end of an highlighted value
 * @param {string} highlightedValue - highlighted attribute as returned by Algolia highlight feature
 * @return {object[]} - An array of {value: string, isHighlighted: boolean}.
 */
function parseHighlightedAttribute({ preTag, postTag, highlightedValue = '' }) {
  const splitByPreTag = highlightedValue.split(preTag);
  const firstValue = splitByPreTag.shift();
  const elements =
    firstValue === '' ? [] : [{ value: firstValue, isHighlighted: false }];

  if (postTag === preTag) {
    let isHighlighted = true;
    splitByPreTag.forEach(split => {
      elements.push({ value: split, isHighlighted });
      isHighlighted = !isHighlighted;
    });
  } else {
    splitByPreTag.forEach(split => {
      const splitByPostTag = split.split(postTag);

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
  }

  return elements;
}

/**
 * Find an highlighted attribute given an `attribute` and an `highlightProperty`, parses it,
 * and provided an array of objects with the string value and a boolean if this
 * value is highlighted.
 *
 * In order to use this feature, highlight must be activated in the configuration of
 * the index. The `preTag` and `postTag` attributes are respectively highlightPreTag and
 * highlightPostTag in Algolia configuration.
 *
 * @param {string} preTag - string used to identify the start of an highlighted value
 * @param {string} postTag - string used to identify the end of an highlighted value
 * @param {string} highlightProperty - the property that contains the highlight structure in the results
 * @param {string} attribute - the highlighted attribute to look for
 * @param {object} hit - the actual hit returned by Algolia.
 * @return {object[]} - An array of {value: string, isHighlighted: boolean}.
 */
export function parseAlgoliaHit({
  preTag = TAG_PLACEHOLDER.highlightPreTag,
  postTag = TAG_PLACEHOLDER.highlightPostTag,
  highlightProperty,
  attribute,
  hit,
}) {
  if (!hit) throw new Error('`hit`, the matching record, must be provided');

  const highlightObject =
    getPropertyByPath(hit[highlightProperty], attribute) || {};

  if (Array.isArray(highlightObject)) {
    return highlightObject.map(item =>
      parseHighlightedAttribute({
        preTag,
        postTag,
        highlightedValue: unescape(item.value),
      })
    );
  }

  return parseHighlightedAttribute({
    preTag,
    postTag,
    highlightedValue: unescape(highlightObject.value),
  });
}
