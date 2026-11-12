import { createToggleRefinementComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type {
  Pragma,
  ToggleRefinementProps as ToggleRefinementUiComponentProps,
} from 'instantsearch-ui-components';

export type {
  ToggleRefinementClassNames,
  ToggleRefinementValue,
} from 'instantsearch-ui-components';
export type ToggleRefinementProps = ToggleRefinementUiComponentProps;

const ToggleRefinementUiComponent = createToggleRefinementComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export const ToggleRefinement = ToggleRefinementUiComponent;
