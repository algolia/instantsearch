import { createSortByComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type {
  Pragma,
  SortByProps as SortByUiComponentProps,
} from 'instantsearch-ui-components';

export type { SortByClassNames } from 'instantsearch-ui-components';
export type SortByProps = SortByUiComponentProps;

const SortByUiComponent = createSortByComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export const SortBy = SortByUiComponent;
