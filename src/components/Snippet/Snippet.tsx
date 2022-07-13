/** @jsx h */
import { cx } from '@algolia/ui-components-shared';
import { h } from 'preact';

import { InternalHighlight } from '../InternalHighlight/InternalHighlight';

import type {
  HighlightProps as InternalHighlightProps,
  HighlightClassNames as InternalHighlightClassNames,
} from '@algolia/ui-components-highlight-vdom';

export type SnippetClassNames = InternalHighlightClassNames;
export type SnippetProps = Omit<InternalHighlightProps, 'classNames'> & {
  classNames?: Partial<SnippetClassNames>;
};

export function Snippet({ classNames = {}, ...props }: SnippetProps) {
  return (
    <InternalHighlight
      classNames={{
        root: cx('ais-Snippet', classNames.root),
        highlighted: cx('ais-Snippet-highlighted', classNames.highlighted),
        nonHighlighted: cx(
          'ais-Snippet-nonHighlighted',
          classNames.nonHighlighted
        ),
        separator: cx('ais-Snippet-separator', classNames.separator),
      }}
      {...props}
    />
  );
}
