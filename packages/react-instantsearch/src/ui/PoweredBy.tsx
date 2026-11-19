import { createPoweredByComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  PoweredByProps as PoweredByUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

export type { PoweredByClassNames } from 'instantsearch-ui-components';

// The shared props resolve the root element's props through the global `JSX`
// namespace, which React 19 no longer populates (`React.JSX` moved out of it),
// so merge React's native `div` props back in — minus the props replaced by
// the widget's own callbacks.
export type PoweredByProps = PoweredByUiComponentProps &
  Omit<React.ComponentProps<'div'>, keyof PoweredByUiComponentProps>;

const PoweredByUiComponent = createPoweredByComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function PoweredBy(props: PoweredByProps) {
  return <PoweredByUiComponent {...props} />;
}
