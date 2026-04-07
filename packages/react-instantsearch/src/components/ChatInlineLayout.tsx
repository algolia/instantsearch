import { createChatInlineLayoutComponent } from 'instantsearch-ui-components';
import { createElement, Fragment } from 'react';

import type { Pragma } from 'instantsearch-ui-components';

export const ChatInlineLayout = createChatInlineLayoutComponent({
  createElement: createElement as Pragma,
  Fragment,
});
