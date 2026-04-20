import { createChatGreetingComponent } from 'instantsearch-ui-components';
import { createElement } from 'react';

import type { Pragma } from 'instantsearch-ui-components';

export const ChatGreeting = createChatGreetingComponent({
  createElement: createElement as Pragma,
});
