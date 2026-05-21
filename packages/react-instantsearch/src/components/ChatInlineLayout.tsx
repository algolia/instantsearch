import { createChatInlineLayoutComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type { Pragma } from 'instantsearch-ui-components';

export const ChatInlineLayout = createChatInlineLayoutComponent({
  createElement: createElement as Pragma,
  Fragment,
}) as ReturnType<typeof createChatInlineLayoutComponent> & {
  $$inlineLayout: true;
};

// Marker used by `<Chat>` to auto-exempt inline layouts from the entry-point
// validation, since inline chats are always visible (no trigger needed).
ChatInlineLayout.$$inlineLayout = true;
