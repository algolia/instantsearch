import {
  getHighlightedParts,
  getPropertyByPath,
} from 'instantsearch.js/es/lib/utils';
import React from 'react';

import { cx } from '../cx';

function HighlightPart({
  children,
  highlightedTagName,
  isHighlighted,
  nonHighlightedTagName,
}) {
  const TagName = isHighlighted ? highlightedTagName : nonHighlightedTagName;

  return (
    <TagName
      className={
        isHighlighted
          ? 'ais-Highlight--highlighted'
          : 'ais-Highlight--nonHighlighted'
      }
    >
      {children}
    </TagName>
  );
}

export function Highlight({
  hit,
  attribute,
  highlightedTagName = 'mark',
  nonHighlightedTagName = 'span',
  separator = ', ',
  ...rest
}) {
  const { value: attributeValue = '' } =
    getPropertyByPath(hit._highlightResult, attribute) || {};
  const parts = getHighlightedParts(attributeValue);

  return (
    <span {...rest} className={cx('ais-Highlight', rest.className)}>
      {parts.map((part, partIndex) => {
        if (Array.isArray(part)) {
          const isLastPart = partIndex === parts.length - 1;

          return (
            <span key={partIndex}>
              {part.map((subPart, subPartIndex) => (
                <HighlightPart
                  key={subPartIndex}
                  highlightedTagName={highlightedTagName}
                  nonHighlightedTagName={nonHighlightedTagName}
                  isHighlighted={subPart.isHighlighted}
                >
                  {subPart.value}
                </HighlightPart>
              ))}

              {!isLastPart && (
                <span className="ais-Highlight-separator">{separator}</span>
              )}
            </span>
          );
        }

        return (
          <HighlightPart
            key={partIndex}
            highlightedTagName={highlightedTagName}
            nonHighlightedTagName={nonHighlightedTagName}
            isHighlighted={part.isHighlighted}
          >
            {part.value}
          </HighlightPart>
        );
      })}
    </span>
  );
}
