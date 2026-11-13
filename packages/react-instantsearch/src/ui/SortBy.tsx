import { createSortByComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  Pragma,
  SortByProps as SortByUiComponentProps,
} from 'instantsearch-ui-components';

export type { SortByClassNames } from 'instantsearch-ui-components';

// The shared props resolve the root element's props through the global `JSX`
// namespace, which React 19 no longer populates (`React.JSX` moved out of it),
// so merge React's native `div` props back in — minus the props replaced by
// the widget's own callbacks.
export type SortByProps = SortByUiComponentProps &
  Omit<React.ComponentProps<'div'>, keyof SortByUiComponentProps>;

const SortByUiComponent = createSortByComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function SortBy(props: SortByProps) {
  return <SortByUiComponent {...props} />;
}
