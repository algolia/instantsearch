import { Hit as AlgoliaHit } from '@algolia/client-search';
import {
  getHighlightedParts,
  getPropertyByPath,
} from 'instantsearch.js/es/lib/utils/index.js';
import type { ReactNode, ReactType } from 'react';

import { cx } from '../utils/cx';

type HighlightPartProps = {
  children: ReactNode;
  highlightedTagName: ReactType;
  nonHighlightedTagName: ReactType;
  isHighlighted: boolean;
};

function HighlightPart({
  children,
  highlightedTagName,
  isHighlighted,
  nonHighlightedTagName,
}: HighlightPartProps) {
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

export type HighlightProps<THit> = {
  hit: THit;
  attribute: keyof THit | string[];
  highlightedTagName?: React.ReactType;
  nonHighlightedTagName?: React.ReactType;
  className?: string;
  separator?: string;
};

export function Highlight<THit extends AlgoliaHit<Record<string, unknown>>>({
  hit,
  attribute,
  highlightedTagName = 'mark',
  nonHighlightedTagName = 'span',
  separator = ', ',
  ...rest
}: HighlightProps<THit>) {
  const { value: attributeValue = '' } =
    getPropertyByPath(hit._highlightResult, attribute as string) || {};
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
