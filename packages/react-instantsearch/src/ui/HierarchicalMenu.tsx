import { createHierarchicalMenuComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  HierarchicalMenuProps as HierarchicalMenuUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

export type {
  HierarchicalMenuClassNames,
  HierarchicalMenuItem,
  HierarchicalMenuTranslations,
} from 'instantsearch-ui-components';

// The shared props resolve the root element's props through the global `JSX`
// namespace, which React 19 no longer populates, so merge React's native `div`
// props back in.
export type HierarchicalMenuProps = HierarchicalMenuUiComponentProps &
  Omit<React.ComponentProps<'div'>, keyof HierarchicalMenuUiComponentProps>;

const HierarchicalMenuUiComponent = createHierarchicalMenuComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function HierarchicalMenu(props: HierarchicalMenuProps) {
  return <HierarchicalMenuUiComponent {...props} />;
}
