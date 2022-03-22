import React, { Fragment } from 'react';

import { cx } from './lib/cx';

type HighlightPartProps = {
  children: React.ReactNode;
  classNames: HighlightClassNames;
  highlightedTagName: React.ReactType;
  nonHighlightedTagName: React.ReactType;
  isHighlighted: boolean;
};

function HighlightPart({
  classNames,
  children,
  highlightedTagName,
  isHighlighted,
  nonHighlightedTagName,
}: HighlightPartProps) {
  const TagName = isHighlighted ? highlightedTagName : nonHighlightedTagName;

  return (
    <TagName
      className={
        isHighlighted ? classNames.highlighted : classNames.nonHighlighted
      }
    >
      {children}
    </TagName>
  );
}

type HighlightedPart = {
  isHighlighted: boolean;
  value: string;
};

export type HighlightClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the highlighted parts
   */
  highlighted: string;
  /**
   * Class names to apply to the non-highlighted parts
   */
  nonHighlighted: string;
  /**
   * Class names to apply to the separator between highlighted parts
   */
  separator: string;
};

export type HighlightProps = React.HTMLAttributes<HTMLSpanElement> & {
  classNames: HighlightClassNames;
  highlightedTagName?: React.ReactType;
  nonHighlightedTagName?: React.ReactType;
  separator?: React.ReactNode;
  parts: HighlightedPart[][];
};

export function Highlight({
  parts,
  highlightedTagName = 'mark',
  nonHighlightedTagName = 'span',
  separator = ', ',
  className,
  classNames,
  ...props
}: HighlightProps) {
  return (
    <span {...props} className={cx(classNames.root, className)}>
      {parts.map((part, partIndex) => {
        const isLastPart = partIndex === parts.length - 1;

        return (
          <Fragment key={partIndex}>
            {part.map((subPart, subPartIndex) => (
              <HighlightPart
                key={subPartIndex}
                classNames={classNames}
                highlightedTagName={highlightedTagName}
                nonHighlightedTagName={nonHighlightedTagName}
                isHighlighted={subPart.isHighlighted}
              >
                {subPart.value}
              </HighlightPart>
            ))}

            {!isLastPart && (
              <span className={classNames.separator}>{separator}</span>
            )}
          </Fragment>
        );
      })}
    </span>
  );
}
