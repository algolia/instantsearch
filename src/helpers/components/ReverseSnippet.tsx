/** @jsx h */
import { h } from 'preact';

import { ReverseSnippet as ReverseSnippetUiComponent } from '../../components/ReverseSnippet/ReverseSnippet';
import getHighlightedParts from '../../lib/utils/getHighlightedParts';
import getPropertyByPath from '../../lib/utils/getPropertyByPath';
import unescape from '../../lib/utils/unescape';
import { warning } from '../../lib/utils';

import type { BaseHit, Hit, PartialKeys } from '../../types';
import type { ReverseSnippetProps as ReverseSnippetUiComponentProps } from '../../components/ReverseSnippet/ReverseSnippet';

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
