import { createChatMessageLoaderComponent } from 'instantsearch-ui-components';
import { createElement } from 'react';

import type { Pragma } from 'instantsearch-ui-components';

export const ChatMessageLoader = createChatMessageLoaderComponent({
  createElement: createElement as Pragma,
});
