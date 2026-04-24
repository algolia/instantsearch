import { createChatOverlayLayoutComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type { Pragma } from 'instantsearch-ui-components';

export const ChatOverlayLayout = createChatOverlayLayoutComponent({
  createElement: createElement as Pragma,
  Fragment,
});
