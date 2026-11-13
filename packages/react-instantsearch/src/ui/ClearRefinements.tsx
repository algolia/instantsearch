import { createClearRefinementsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  ClearRefinementsProps as ClearRefinementsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

export type {
  ClearRefinementsClassNames,
  ClearRefinementsTranslations,
} from 'instantsearch-ui-components';

// The shared props resolve the root element's props through the global `JSX`
// namespace, which React 19 no longer populates (`React.JSX` moved out of it),
// so merge React's native `div` props back in — minus the props replaced by
// the widget's own callbacks.
export type ClearRefinementsProps = ClearRefinementsUiComponentProps &
  Omit<React.ComponentProps<'div'>, keyof ClearRefinementsUiComponentProps>;

const ClearRefinementsUiComponent = createClearRefinementsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function ClearRefinements(props: ClearRefinementsProps) {
  return <ClearRefinementsUiComponent {...props} />;
}
