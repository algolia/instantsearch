import { createHitsPerPageComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  HitsPerPageProps as HitsPerPageUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

export type {
  HitsPerPageClassNames,
  HitsPerPageItem,
} from 'instantsearch-ui-components';

// The shared props resolve the root element's props through the global `JSX`
// namespace, which React 19 no longer populates (`React.JSX` moved out of it),
// so merge React's native `div` props back in — minus the props replaced by
// the widget's own callbacks.
export type HitsPerPageProps = HitsPerPageUiComponentProps &
  Omit<React.ComponentProps<'div'>, keyof HitsPerPageUiComponentProps>;

const HitsPerPageUiComponent = createHitsPerPageComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function HitsPerPage(props: HitsPerPageProps) {
  return <HitsPerPageUiComponent {...props} />;
}
