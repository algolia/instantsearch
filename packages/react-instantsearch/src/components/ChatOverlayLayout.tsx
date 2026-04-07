import { createChatOverlayLayoutComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type { ChatLayoutOwnProps, Pragma } from 'instantsearch-ui-components';

export type { ChatLayoutOwnProps };

export const ChatOverlayLayout = createChatOverlayLayoutComponent({
  createElement: createElement as Pragma,
  Fragment,
});
