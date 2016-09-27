import React from 'react';

function extractTagName(highlightedValue) {
  const tagParse = (/<(.+?)>/).exec(highlightedValue);
  return tagParse === null ? null : tagParse[1];
}

/**
 * This function transforms an highlighted response
 * to an array of React elements. This should be
 * used in place of dangerouslySetInnerHTML when
 * using the highlightReasult provided by Algolia.
 *
 * The function autodetects which tag is used in
 * results to highlight, and creates the corresponding
 * React element.
 *
 * It also creates keys on React elements to avoid warnings.
 *
 * The genegrated highlighted Elements use the `ais-hightlightedValue`
 * class name attached.
 *
 * @param {string} attribute the name of the attribute for which we want the highlighted value
 * @param {object} hit the hit from the algolia response
 * @returns {Array.<string|ReactElement>} the array of react element
 * @example
 * const ProductHits = Hits.connect(({hits}) => {
 *   const hitComponents = hits.map( hit =>
 *     <div key={hit.objectID}>
 *       <span className="hit-name">{hightlight('name', hit)}</span>
 *     </div>
 *   );
 *
 *   return <div className="hits">{hitComponents}</div>;
 * });
 */
export default function hightlight(attribute, hit) {
  if (!hit) throw new Error('The hit containing the attribute should be provided');
  if (!hit.hasOwnProperty(attribute)) throw new Error(`${attribute} should be a retrievable attribute.`);
  if (!hit._highlightResult ||
      !hit._highlightResult.hasOwnProperty(attribute)){
    throw new Error(`${attribute} should be an highlighted attribute`);
  }

  const highlightedValue = hit._highlightResult[attribute].value;
  const tag = extractTagName(highlightedValue);
  const firstPassSplit = highlightedValue.split(`<${tag}>`);
  const firstValue = firstPassSplit.shift();
  const elements = firstValue === '' ? [] : [firstValue];

  firstPassSplit.forEach((split, i) => {
    const s = split.split(`</${tag}>`);
    elements.push(
      React.createElement(
        tag,
        {
          key: `split-${i}-${s[0]}`,
          className: 'ais-highlightedValue',
        },
        s[0]
      )
    );
    if (s[1] !== '') elements.push(s[1]);
  });

  return elements;
}
