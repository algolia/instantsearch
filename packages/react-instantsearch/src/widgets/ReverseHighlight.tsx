import {
  getHighlightedParts,
  getPropertyByPath,
  unescape,
} from 'instantsearch.js/es/lib/utils';
import React from 'react';

import { ReverseHighlight as ReverseHighlightUiComponent } from '../ui/ReverseHighlight';

import type { PartialKeys } from '../types';
import type { ReverseHighlightProps as ReverseHighlightUiComponentProps } from '../ui/ReverseHighlight';
import type { BaseHit, Hit } from 'instantsearch.js';

export type ReverseHighlightProps<THit extends Hit<BaseHit>> = {
  hit: THit;
  attribute: keyof THit | string[];
} & PartialKeys<
  Omit<ReverseHighlightUiComponentProps, 'parts'>,
  'highlightedTagName' | 'nonHighlightedTagName' | 'separator'
>;

export function ReverseHighlight<THit extends Hit<BaseHit>>({
  hit,
  attribute,
  highlightedTagName,
  nonHighlightedTagName,
  separator,
  ...props
}: ReverseHighlightProps<THit>) {
  const property =
    getPropertyByPath(hit._highlightResult, attribute as string) || [];
  const properties = Array.isArray(property) ? property : [property];

  const parts = properties.map((singleValue) =>
    getHighlightedParts(unescape(singleValue.value || '')).map(
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
      highlightedTagName={highlightedTagName}
      nonHighlightedTagName={nonHighlightedTagName}
      separator={separator}
    />
  );
}
