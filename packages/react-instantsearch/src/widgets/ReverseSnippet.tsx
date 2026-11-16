import { getHighlightedParts, getPropertyByPath } from 'instantsearch-core';
import React from 'react';

import { ReverseSnippet as ReverseSnippetUiComponent } from '../ui/ReverseSnippet';

import type { PartialKeys } from '../types';
import type { ReverseSnippetProps as ReverseSnippetUiComponentProps } from '../ui/ReverseSnippet';
import type { BaseHit, Hit } from 'instantsearch-core';

export type ReverseSnippetProps<THit extends Hit<BaseHit>> = {
  hit: THit;
  attribute: keyof THit | string[];
} & PartialKeys<
  Omit<ReverseSnippetUiComponentProps, 'parts'>,
  'highlightedTagName' | 'nonHighlightedTagName' | 'separator'
>;

export function ReverseSnippet<THit extends Hit<BaseHit>>({
  hit,
  attribute,
  highlightedTagName,
  nonHighlightedTagName,
  separator,
  ...props
}: ReverseSnippetProps<THit>) {
  const property =
    getPropertyByPath(hit._snippetResult, attribute as string) || [];
  const properties = Array.isArray(property) ? property : [property];

  const parts = properties.map((singleValue) =>
    getHighlightedParts(singleValue.value || '').map(
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
      highlightedTagName={highlightedTagName}
      nonHighlightedTagName={nonHighlightedTagName}
      separator={separator}
    />
  );
}
