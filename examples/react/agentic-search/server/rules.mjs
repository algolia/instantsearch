// The agentic trigger, as Algolia query rules. `scripts/setup-rules.mjs`
// saves these on the real index; the fake backend evaluates the same
// definitions, so both backends trigger the same way.
//
// The client sends one rule context per mode (see `src/agent/modes.ts`):
//   auto   → AUTO_CONTEXT: the rule fires when the query contains a phrase
//   agent  → AGENT_CONTEXT: the rule always fires
//   search → no context: nothing fires
//
// A rule's `renderingContent` only accepts `facetOrdering`, `redirect` and
// `widgets`, so the trigger lives under `widgets`:
//   renderingContent.widgets.agenticSearch = { enabled, agentId | stream }

export const AUTO_CONTEXT = 'agentic-search-poc-auto';
export const AGENT_CONTEXT = 'agentic-search-poc-agent';

/**
 * Phrases that make a query read like a request rather than keywords. Rule
 * patterns match whole words, case-insensitively. A rule holds at most 25
 * conditions.
 */
export const AGENTIC_PHRASES = [
  'give me',
  'i need',
  'i want',
  'looking for',
  'something',
  'recommend',
  'suggest',
  'help me',
  'what',
  'which',
  'how',
  'best',
  'under',
  'below',
  'less than',
];

/** The consequence both rules share. */
export function agenticConsequence(trigger) {
  return {
    params: {
      renderingContent: {
        widgets: { agenticSearch: { enabled: true, ...trigger } },
      },
      // The broad query behind an agentic request: a sentence rarely matches
      // every word, but its facets should still be useful.
      removeWordsIfNoResults: 'allOptional',
    },
  };
}

export function buildRules(trigger) {
  return [
    {
      objectID: 'agentic-search-poc-auto',
      description: 'Agentic search POC: natural-language queries (Auto mode)',
      enabled: true,
      conditions: AGENTIC_PHRASES.map((pattern) => ({
        anchoring: 'contains',
        pattern,
        context: AUTO_CONTEXT,
      })),
      consequence: agenticConsequence(trigger),
    },
    {
      objectID: 'agentic-search-poc-agent',
      description: 'Agentic search POC: every query (Ask AI mode)',
      enabled: true,
      conditions: [{ context: AGENT_CONTEXT }],
      consequence: agenticConsequence(trigger),
    },
  ];
}

const tokens = (text) =>
  ` ${String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .filter(Boolean)
    .join(' ')} `;

/** What the rules above would do for this query, for the fake backend. */
export function matchesAgenticRules(query, ruleContexts = []) {
  const contexts = [].concat(ruleContexts);
  if (!String(query || '').trim()) return false;
  if (contexts.includes(AGENT_CONTEXT)) return true;
  if (!contexts.includes(AUTO_CONTEXT)) return false;
  const haystack = tokens(query);
  return AGENTIC_PHRASES.some((phrase) => haystack.includes(tokens(phrase)));
}
