import { createRefinementListComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  Pragma,
  RefinementListProps as RefinementListUiComponentProps,
} from 'instantsearch-ui-components';

export type {
  RefinementListClassNames,
  RefinementListTranslations,
} from 'instantsearch-ui-components';

// The shared props resolve the root element's props through the global `JSX`
// namespace, which React 19 no longer populates, so merge React's native `div`
// props back in.
export type RefinementListProps = RefinementListUiComponentProps &
  Omit<React.ComponentProps<'div'>, keyof RefinementListUiComponentProps>;

const RefinementListUiComponent = createRefinementListComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function RefinementList(props: RefinementListProps) {
  return <RefinementListUiComponent {...props} />;
}
