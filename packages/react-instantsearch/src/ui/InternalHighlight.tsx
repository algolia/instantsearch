import { createHighlightComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type { Pragma } from 'instantsearch-ui-components';

export const InternalHighlight = createHighlightComponent({
  createElement: createElement as Pragma,
  Fragment,
});
