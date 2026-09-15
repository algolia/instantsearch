import { filterSuggestions as fn } from 'instantsearch.js/es/widgets';

import { SHOWCASE_AGENT_ID } from '../../../constants';
import { defineWidget } from '../types';

export const filterSuggestions = defineWidget({
  name: 'filterSuggestions',
  fn,
  // Suggested filters read as chips above the results.
  slot: 'toolbar',
  replaces: [],
  defaults: [
    {
      key: 'agentId',
      label: 'SHOWCASE_AGENT_ID',
      value: { agentId: SHOWCASE_AGENT_ID },
    },
    {
      key: 'attributes',
      label: "['brand', 'categories']",
      value: { attributes: ['brand', 'categories'] },
    },
  ],
  toggles: [
    {
      key: 'maxSuggestions',
      label: '2',
      value: { maxSuggestions: 2 },
    },
    {
      key: 'debounceMs',
      label: '600',
      value: { debounceMs: 600 },
    },
    {
      key: 'hitsToSample',
      label: '5',
      value: { hitsToSample: 5 },
    },
  ],
});
