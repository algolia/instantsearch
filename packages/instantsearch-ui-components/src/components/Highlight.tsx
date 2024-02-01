/** @jsx createElement */
import { cx } from '../lib';

import type {
  ComponentChildren,
  ComponentProps,
  ElementType,
  Renderer,
} from '../types';

type HighlightPartProps = {
  children: ComponentChildren;
  classNames: Partial<HighlightClassNames>;
  highlightedTagName: ElementType;
  nonHighlightedTagName: ElementType;
  isHighlighted: boolean;
};

function createHighlightPartComponent({ createElement }: Renderer) {
  return function HighlightPart({
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
  };
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

export type HighlightProps = ComponentProps<'span'> & {
  classNames?: Partial<HighlightClassNames>;
  highlightedTagName?: ElementType;
  nonHighlightedTagName?: ElementType;
  separator?: ComponentChildren;
  parts: HighlightedPart[][];
};

export function createHighlightComponent({
  createElement,
  Fragment,
}: Renderer) {
  const HighlightPart = createHighlightPartComponent({
    createElement,
    Fragment,
  });

  return function Highlight(userProps: HighlightProps) {
    // Not destructured in function signature, to make sure it's not exposed in
    // the type definition.
    const {
      parts,
      highlightedTagName = 'mark',
      nonHighlightedTagName = 'span',
      separator = ', ',
      className,
      classNames = {},
      ...props
    } = userProps;

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
                <span className={classNames.separator}>
                  {/* @ts-ignore-next-line */}
                  {separator}
                </span>
              )}
            </Fragment>
          );
        })}
      </span>
    );
  };
}
