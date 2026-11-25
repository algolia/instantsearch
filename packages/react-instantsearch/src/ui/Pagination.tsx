import { createPaginationComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  Pragma,
  PaginationProps as PaginationUiComponentProps,
} from 'instantsearch-ui-components';

export type {
  PageItemTextOptions,
  PaginationClassNames,
  PaginationTranslations,
} from 'instantsearch-ui-components';

// The shared props resolve the root element's props through the global `JSX`
// namespace, which React 19 no longer populates (`React.JSX` moved out of it),
// so merge React's native `div` props back in.
export type PaginationProps = PaginationUiComponentProps &
  Omit<React.ComponentProps<'div'>, keyof PaginationUiComponentProps>;

const PaginationUiComponent = createPaginationComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function Pagination(props: PaginationProps) {
  return <PaginationUiComponent {...props} />;
}
