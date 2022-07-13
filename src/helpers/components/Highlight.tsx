/** @jsx h */
import { h } from 'preact';

import { Highlight as HighlightUiComponent } from '../../components/Highlight/Highlight';
import getHighlightedParts from '../../lib/utils/getHighlightedParts';
import getPropertyByPath from '../../lib/utils/getPropertyByPath';
import unescape from '../../lib/utils/unescape';

import type { BaseHit, Hit, PartialKeys } from '../../types';
import type { HighlightProps as HighlightUiComponentProps } from '../../components/Highlight/Highlight';

export type HighlightProps<THit extends Hit<BaseHit>> = {
  hit: THit;
  attribute: keyof THit | string[];
  cssClasses: HighlightUiComponentProps['classNames'];
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
  const property =
    getPropertyByPath(hit._highlightResult, attribute as string) || [];
  const properties = Array.isArray(property) ? property : [property];

  const parts = properties.map(({ value }) =>
    getHighlightedParts(unescape(value || ''))
  );

  return (
    <HighlightUiComponent {...props} parts={parts} classNames={cssClasses} />
  );
}
