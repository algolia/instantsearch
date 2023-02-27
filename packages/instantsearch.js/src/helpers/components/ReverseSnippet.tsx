/** @jsx h */
import { h } from 'preact';

import { ReverseSnippet as ReverseSnippetUiComponent } from '../../components/ReverseSnippet/ReverseSnippet';
import {
  getPropertyByPath,
  unescape,
  toArray,
  warning,
  getHighlightedParts,
} from '../../lib/utils';

import type { ReverseSnippetProps as ReverseSnippetUiComponentProps } from '../../components/ReverseSnippet/ReverseSnippet';
import type {
  BaseHit,
  Hit,
  HitAttributeSnippetResult,
  PartialKeys,
} from '../../types';

export type ReverseSnippetProps<THit extends Hit<BaseHit>> = {
  hit: THit;
  attribute: keyof THit | string[];
  cssClasses?: ReverseSnippetUiComponentProps['classNames'];
} & PartialKeys<
  Omit<ReverseSnippetUiComponentProps, 'parts' | 'classNames'>,
  'highlightedTagName' | 'nonHighlightedTagName' | 'separator'
>;

export function ReverseSnippet<THit extends Hit<BaseHit>>({
  hit,
  attribute,
  cssClasses,
  ...props
}: ReverseSnippetProps<THit>) {
  const property: HitAttributeSnippetResult | HitAttributeSnippetResult[] =
    getPropertyByPath(hit._snippetResult, attribute as string) || [];
  const properties = toArray(property);

  warning(
    Boolean(properties.length),
    `Could not enable snippet for "${attribute.toString()}", will display an empty string.
Please check whether this attribute exists and is specified in \`attributesToSnippet\`.

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
    <ReverseSnippetUiComponent
      {...props}
      parts={parts}
      classNames={cssClasses}
    />
  );
}
