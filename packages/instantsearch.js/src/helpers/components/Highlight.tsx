/** @jsx h */
import { h } from 'preact';

import { Highlight as HighlightUiComponent } from '../../components/Highlight/Highlight';
import {
  getPropertyByPath,
  unescape,
  toArray,
  warning,
  getHighlightedParts,
} from '../../lib/utils';

import type { HighlightProps as HighlightUiComponentProps } from '../../components/Highlight/Highlight';
import type {
  BaseHit,
  Hit,
  HitAttributeHighlightResult,
  PartialKeys,
} from '../../types';

export type HighlightProps<THit extends Hit<BaseHit>> = {
  hit: THit;
  attribute: keyof THit | string[];
  cssClasses?: HighlightUiComponentProps['classNames'];
} & PartialKeys<
  Omit<HighlightUiComponentProps, 'parts' | 'classNames'>,
  'highlightedTagName' | 'nonHighlightedTagName' | 'separator'
>;

export function Highlight<THit extends Hit<BaseHit>>({
  hit,
  attribute,
  cssClasses,
  ...props
}: HighlightProps<THit>) {
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
    getHighlightedParts(unescape(value || ''))
  );

  return (
    <HighlightUiComponent {...props} parts={parts} classNames={cssClasses} />
  );
}
