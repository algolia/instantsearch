import { createMenuComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  MenuClassNames,
  MenuProps as MenuUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

export type {
  MenuClassNames,
  MenuItem,
  MenuTranslations,
} from 'instantsearch-ui-components';

/**
 * @deprecated Use `MenuClassNames` instead.
 */
export type MenuCSSClasses = MenuClassNames;

// The shared props resolve the root element's props through the global `JSX`
// namespace, which React 19 no longer populates, so merge React's native `div`
// props back in.
export type MenuProps = MenuUiComponentProps &
  Omit<React.ComponentProps<'div'>, keyof MenuUiComponentProps>;

const MenuUiComponent = createMenuComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function Menu(props: MenuProps) {
  return <MenuUiComponent {...props} />;
}
