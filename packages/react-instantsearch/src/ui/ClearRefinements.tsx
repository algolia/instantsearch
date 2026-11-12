import { createClearRefinementsComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type {
  ClearRefinementsProps as ClearRefinementsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

export type {
  ClearRefinementsClassNames,
  ClearRefinementsTranslations,
} from 'instantsearch-ui-components';
export type ClearRefinementsProps = ClearRefinementsUiComponentProps;

const ClearRefinementsUiComponent = createClearRefinementsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export const ClearRefinements = ClearRefinementsUiComponent;
