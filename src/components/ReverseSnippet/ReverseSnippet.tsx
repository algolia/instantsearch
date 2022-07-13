/** @jsx h */
import { cx } from '@algolia/ui-components-shared';
import { h } from 'preact';

import { InternalHighlight } from '../InternalHighlight/InternalHighlight';

import type {
  HighlightProps as InternalHighlightProps,
  HighlightClassNames as InternalHighlightClassNames,
} from '@algolia/ui-components-highlight-vdom';

export type ReverseSnippetClassNames = InternalHighlightClassNames;
export type ReverseSnippetProps = Omit<InternalHighlightProps, 'classNames'> & {
  classNames?: Partial<ReverseSnippetClassNames>;
};

export function ReverseSnippet({
  classNames = {},
  ...props
}: ReverseSnippetProps) {
  return (
    <InternalHighlight
      classNames={{
        root: cx('ais-ReverseSnippet', classNames.root),
        highlighted: cx(
          'ais-ReverseSnippet-highlighted',
          classNames.highlighted
        ),
        nonHighlighted: cx(
          'ais-ReverseSnippet-nonHighlighted',
          classNames.nonHighlighted
        ),
        separator: cx('ais-ReverseSnippet-separator', classNames.separator),
      }}
      {...props}
    />
  );
}
