// @ts-nocheck
/** @jsx h */
import { h, Fragment } from 'preact';

export function cx(
  ...classNames: Array<string | number | boolean | undefined | null>
) {
  return classNames.filter(Boolean).join(' ');
}

function HighlightPart({
  classNames,
  children,
  highlightedTagName,
  isHighlighted,
  nonHighlightedTagName,
}) {
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

export function InternalHighlight({
  parts,
  highlightedTagName = 'mark',
  nonHighlightedTagName = 'span',
  separator = ', ',
  className,
  classNames,
  ...props
}) {
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
