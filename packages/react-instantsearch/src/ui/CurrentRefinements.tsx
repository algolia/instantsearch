import { createCurrentRefinementsComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type {
  CurrentRefinementsProps as CurrentRefinementsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

export type {
  CurrentRefinementsClassNames,
  CurrentRefinementsItem,
  CurrentRefinementsRefinement,
} from 'instantsearch-ui-components';
export type CurrentRefinementsProps = CurrentRefinementsUiComponentProps;

const CurrentRefinementsUiComponent = createCurrentRefinementsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export const CurrentRefinements = CurrentRefinementsUiComponent;
