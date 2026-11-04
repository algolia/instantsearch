import {
  getHighlightedParts,
  getPropertyByPath,
  unescape,
} from 'instantsearch-core';
import React from 'react';

import { Snippet as SnippetUiComponent } from '../ui/Snippet';

import type { PartialKeys } from '../types';
import type { SnippetProps as SnippetUiComponentProps } from '../ui/Snippet';
import type { BaseHit, Hit } from 'instantsearch-core';

export type SnippetProps<THit extends Hit<BaseHit>> = {
  hit: THit;
  attribute: keyof THit | string[];
} & PartialKeys<
  Omit<SnippetUiComponentProps, 'parts'>,
  'highlightedTagName' | 'nonHighlightedTagName' | 'separator'
>;

export function Snippet<THit extends Hit<BaseHit>>({
  hit,
  attribute,
  highlightedTagName,
  nonHighlightedTagName,
  separator,
  ...props
}: SnippetProps<THit>) {
  const property =
    getPropertyByPath(hit._snippetResult, attribute as string) || [];
  const properties = Array.isArray(property) ? property : [property];

  const parts = properties.map((singleValue) =>
    getHighlightedParts(unescape(singleValue.value || ''))
  );

  return (
    <SnippetUiComponent
      {...props}
      parts={parts}
      highlightedTagName={highlightedTagName}
      nonHighlightedTagName={nonHighlightedTagName}
      separator={separator}
    />
  );
}
