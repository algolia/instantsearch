import { createPoweredByComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type {
  PoweredByProps as PoweredByUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

export type { PoweredByClassNames } from 'instantsearch-ui-components';
export type PoweredByProps = PoweredByUiComponentProps;

const PoweredByUiComponent = createPoweredByComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export const PoweredBy = PoweredByUiComponent;
