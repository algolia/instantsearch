/** @jsx h */
import { cx } from 'instantsearch-ui-components';
import { h } from 'preact';

import { InternalHighlight } from '../InternalHighlight/InternalHighlight';

import type {
  HighlightProps as InternalHighlightProps,
  HighlightClassNames as InternalHighlightClassNames,
} from 'instantsearch-ui-components';

export type HighlightClassNames = InternalHighlightClassNames;
export type HighlightProps = Omit<InternalHighlightProps, 'classNames'> & {
  classNames?: Partial<HighlightClassNames>;
};

export function Highlight({ classNames = {}, ...props }: HighlightProps) {
  return (
    <InternalHighlight
      classNames={{
        root: cx('ais-Highlight', classNames.root),
        highlighted: cx('ais-Highlight-highlighted', classNames.highlighted),
        nonHighlighted: cx(
          'ais-Highlight-nonHighlighted',
          classNames.nonHighlighted
        ),
        separator: cx('ais-Highlight-separator', classNames.separator),
      }}
      {...props}
    />
  );
}
