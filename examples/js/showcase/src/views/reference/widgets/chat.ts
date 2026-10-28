import { chatInlineLayout } from 'instantsearch.js/es/templates';
import { chat as fn } from 'instantsearch.js/es/widgets';

import { renderCarouselHit } from '../../../components/widgets/ProductCard';
import { SHOWCASE_AGENT_ID } from '../../../constants';
import { defineWidget } from '../types';

export const chat = defineWidget({
  name: 'chat',
  fn,
  flavors: ['js', 'react'],
  // The chat is a whole conversational surface, not a piece of a search UI.
  slot: 'alone',
  replaces: [],
  defaults: [
    {
      key: 'agentId',
      label: 'SHOWCASE_AGENT_ID',
      value: { agentId: SHOWCASE_AGENT_ID },
    },
    {
      key: 'templates',
      flavors: ['js'],
      label: '{ layout: chatInlineLayout(), item: renderCarouselHit }',
      value: {
        templates: {
          layout: chatInlineLayout(),
          item: renderCarouselHit,
        },
      },
    },
  ],
  // `resume` is omitted: it picks up an ongoing generation stream, so it needs
  // one in flight plus a backend serving the GET resume endpoint. Against this
  // agent it just answers 405 on mount.
  toggles: [
    {
      key: 'feedback',
      label: 'true',
      value: { feedback: true },
    },
    {
      key: 'initialUserMessage',
      label: "'Show me a cheap camera'",
      value: { initialUserMessage: 'Show me a cheap camera' },
    },
    {
      key: 'requiresSearch',
      label: 'false',
      value: { requiresSearch: false },
    },
    {
      key: 'context',
      label: "{ page: 'reference' }",
      value: { context: { page: 'reference' } },
    },
  ],
});
