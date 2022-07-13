/** @jsx h */
import { h } from 'preact';

import { Snippet as SnippetUiComponent } from '../../components/Snippet/Snippet';
import getHighlightedParts from '../../lib/utils/getHighlightedParts';
import getPropertyByPath from '../../lib/utils/getPropertyByPath';
import unescape from '../../lib/utils/unescape';
import { warning } from '../../lib/utils';

import type { BaseHit, Hit, PartialKeys } from '../../types';
import type { SnippetProps as SnippetUiComponentProps } from '../../components/Snippet/Snippet';

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
  const property =
    getPropertyByPath(hit._snippetResult, attribute as string) || [];
  const properties = Array.isArray(property) ? property : [property];

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
