/** @jsx h */
import { h } from 'preact';

import { Snippet as SnippetUiComponent } from '../../components/Snippet/Snippet';
import {
  getPropertyByPath,
  unescape,
  toArray,
  warning,
  getHighlightedParts,
} from '../../lib/utils';

import type { SnippetProps as SnippetUiComponentProps } from '../../components/Snippet/Snippet';
import type {
  BaseHit,
  Hit,
  HitAttributeSnippetResult,
  PartialKeys,
} from '../../types';

export type SnippetProps<THit extends Hit<BaseHit>> = {
  hit: THit;
  attribute: keyof THit | string[];
  cssClasses?: SnippetUiComponentProps['classNames'];
} & PartialKeys<
  Omit<SnippetUiComponentProps, 'parts' | 'classNames'>,
  'highlightedTagName' | 'nonHighlightedTagName' | 'separator'
>;

export function Snippet<THit extends Hit<BaseHit>>({
  hit,
  attribute,
  cssClasses,
  ...props
}: SnippetProps<THit>) {
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
    getHighlightedParts(unescape(value || ''))
  );

  return (
    <SnippetUiComponent {...props} parts={parts} classNames={cssClasses} />
  );
}
