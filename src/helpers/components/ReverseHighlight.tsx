/** @jsx h */
import { h } from 'preact';

import { ReverseHighlight as ReverseHighlightUiComponent } from '../../components/ReverseHighlight/ReverseHighlight';
// These utils are individually imported, as utils/renderTemplate imports helpers/components, importing lib/utils would create a circular dependency.
import { getPropertyByPath } from '../../lib/utils/getPropertyByPath';
import { toArray } from '../../lib/utils/toArray';
import { warning } from '../../lib/utils/logger';
import { getHighlightedParts } from '../../lib/utils/getHighlightedParts';

import type {
  BaseHit,
  Hit,
  HitAttributeHighlightResult,
  PartialKeys,
} from '../../types';
import type { ReverseHighlightProps as ReverseHighlightUiComponentProps } from '../../components/ReverseHighlight/ReverseHighlight';

export type ReverseHighlightProps<THit extends Hit<BaseHit>> = {
  hit: THit;
  attribute: keyof THit | string[];
  cssClasses?: ReverseHighlightUiComponentProps['classNames'];
} & PartialKeys<
  Omit<ReverseHighlightUiComponentProps, 'parts' | 'classNames'>,
  'highlightedTagName' | 'nonHighlightedTagName' | 'separator'
>;

export function ReverseHighlight<THit extends Hit<BaseHit>>({
  hit,
  attribute,
  cssClasses,
  ...props
}: ReverseHighlightProps<THit>) {
  const property: HitAttributeHighlightResult | HitAttributeHighlightResult[] =
    getPropertyByPath(hit._highlightResult, attribute as string) || [];
  const properties = toArray(property);

  warning(
    Boolean(properties.length),
    `Could not enable highlight for "${attribute.toString()}", will display an empty string.
Please check whether this attribute exists and is either searchable or specified in \`attributesToHighlight\`.

See: https://alg.li/highlighting
`
  );

  const parts = properties.map(({ value }) =>
    getHighlightedParts(unescape(value || '')).map(
      ({ isHighlighted, ...rest }) => ({
        ...rest,
        isHighlighted: !isHighlighted,
      })
    )
  );

  return (
    <ReverseHighlightUiComponent
      {...props}
      parts={parts}
      classNames={cssClasses}
    />
  );
}
