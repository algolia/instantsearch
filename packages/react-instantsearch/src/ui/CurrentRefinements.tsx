import { createCurrentRefinementsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  CurrentRefinementsProps as CurrentRefinementsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

export type {
  CurrentRefinementsClassNames,
  CurrentRefinementsItem,
  CurrentRefinementsRefinement,
} from 'instantsearch-ui-components';

// The shared props resolve the root element's props through the global `JSX`
// namespace, which React 19 no longer populates (`React.JSX` moved out of it),
// so merge React's native `div` props back in — minus the props replaced by
// the widget's own callbacks.
export type CurrentRefinementsProps = CurrentRefinementsUiComponentProps &
  Omit<React.ComponentProps<'div'>, keyof CurrentRefinementsUiComponentProps>;

const CurrentRefinementsUiComponent = createCurrentRefinementsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function CurrentRefinements(props: CurrentRefinementsProps) {
  return <CurrentRefinementsUiComponent {...props} />;
}
