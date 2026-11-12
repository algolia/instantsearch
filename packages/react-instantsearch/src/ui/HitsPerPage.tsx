import { createHitsPerPageComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type {
  HitsPerPageProps as HitsPerPageUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

export type {
  HitsPerPageClassNames,
  HitsPerPageItem,
} from 'instantsearch-ui-components';
export type HitsPerPageProps = HitsPerPageUiComponentProps;

const HitsPerPageUiComponent = createHitsPerPageComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export const HitsPerPage = HitsPerPageUiComponent;
