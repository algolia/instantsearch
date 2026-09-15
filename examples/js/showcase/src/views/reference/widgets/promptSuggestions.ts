import { promptSuggestions as fn } from 'instantsearch.js/es/widgets';

import { SHOWCASE_AGENT_ID } from '../../../constants';
import { defineWidget } from '../types';

/** The three prompt configurations the Agentic view uses. */
const PLP = 'algolia_prompt_suggestions_553c8924-df38-403e-a302-f977a8963700';
const PDP = 'algolia_prompt_suggestions_15a040ea-25ed-41ac-9615-3184383c57d4';
const GUIDE = 'algolia_prompt_suggestions_b31fd5dd-0d44-4567-b2a0-f6891c5b71a1';

export const promptSuggestions = defineWidget({
  name: 'promptSuggestions',
  fn,
  // Prompts belong under the search box, where a user starts.
  slot: 'search',
  requiresWidgets: ['chat'],
  replaces: [],
  defaults: [
    {
      key: 'agentId',
      label: 'SHOWCASE_AGENT_ID',
      value: { agentId: SHOWCASE_AGENT_ID },
    },
    {
      // Required. The PLP configuration reads the live query, filters and
      // results, so it's the one that suits this search frame.
      key: 'configurationId',
      label: "'…553c8924' (PLP)",
      value: { configurationId: PLP },
    },
    {
      key: 'transformHits',
      label: 'firstFiveHits',
      value: { transformHits: firstFiveHits },
    },
  ],
  // The other two configurations replace the default one: same key, so
  // picking one releases the other.
  toggles: [
    {
      key: 'configurationId',
      label: "'…15a040ea' (PDP)",
      value: {
        configurationId: PDP,
        context: {
          focalProduct: {
            objectID: 'amazon-fire-tv-stick',
            name: 'Amazon Fire TV Stick',
            brand: 'Amazon',
          },
        },
      },
    },
    {
      key: 'configurationId',
      label: "'…b31fd5dd' (guide)",
      value: {
        configurationId: GUIDE,
        context: {
          pageTitle: 'Home entertainment buying guide',
          audience: 'Budget-conscious shoppers',
        },
      },
    },
  ],
});

function firstFiveHits(hits: Array<Record<string, unknown>>) {
  return hits.slice(0, 5).map((hit) => ({
    objectID: hit.objectID,
    name: hit.name,
    brand: hit.brand,
    price: hit.price,
  }));
}
