/** @jsx h */
import { cx } from '@algolia/ui-components-shared';
import type {
  HighlightProps as InternalHighlightProps,
  HighlightClassNames as InternalHighlightClassNames,
} from '@algolia/ui-components-highlight-vdom';
import { h } from 'preact';

import { InternalHighlight } from './InternalHighlight';

export type ReverseHighlightClassNames = InternalHighlightClassNames;
export type ReverseHighlightProps = Omit<
  InternalHighlightProps,
  'classNames'
> & {
  classNames?: Partial<ReverseHighlightClassNames>;
};

export function ReverseHighlight({
  classNames = {},
  ...props
}: ReverseHighlightProps) {
  return (
    <InternalHighlight
      classNames={{
        root: cx('ais-ReverseHighlight', classNames.root),
        highlighted: cx(
          'ais-ReverseHighlight-highlighted',
          classNames.highlighted
        ),
        nonHighlighted: cx(
          'ais-ReverseHighlight-nonHighlighted',
          classNames.nonHighlighted
        ),
        separator: cx('ais-ReverseHighlight-separator', classNames.separator),
      }}
      {...props}
    />
  );
}
