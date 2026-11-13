import { createToggleRefinementComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  Pragma,
  ToggleRefinementProps as ToggleRefinementUiComponentProps,
} from 'instantsearch-ui-components';

export type {
  ToggleRefinementClassNames,
  ToggleRefinementValue,
} from 'instantsearch-ui-components';

// The shared props resolve the root element's props through the global `JSX`
// namespace, which React 19 no longer populates (`React.JSX` moved out of it),
// so merge React's native `div` props back in — minus the props replaced by
// the widget's own callbacks.
export type ToggleRefinementProps = ToggleRefinementUiComponentProps &
  Omit<React.ComponentProps<'div'>, keyof ToggleRefinementUiComponentProps>;

const ToggleRefinementUiComponent = createToggleRefinementComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function ToggleRefinement(props: ToggleRefinementProps) {
  return <ToggleRefinementUiComponent {...props} />;
}
