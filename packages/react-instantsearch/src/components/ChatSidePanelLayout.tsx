import { createChatSidePanelLayoutComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type { Pragma } from 'instantsearch-ui-components';

export const ChatSidePanelLayout = createChatSidePanelLayoutComponent({
  createElement: createElement as Pragma,
  Fragment,
});
