# Agentic search POC: review

A review of the proof of concept in `examples/react/agentic-search`, built from `agentic-search-poc.md`. It covers what works, what doesn't, the hacks the demo depends on, and the steps to turn it into something that ships.

## What the POC is

A React InstantSearch page with no backend of its own in its main mode:

- **Regular search** goes straight to the `instant_search` index in the `latency` app with the public search key.
- **Two query rules** on that index (`server/rules.mjs`, saved by `yarn setup-rules`) decide agentic mode. When one fires, the response carries `renderingContent.widgets.agenticSearch: { enabled: true, agentId }` and the broad query gets `removeWordsIfNoResults: 'allOptional'`. The Auto / Search / Ask AI switch picks which rule context the client sends.
- **An agent panel** replaces the hits: reasoning, an answer, the products the agent picked, "Show more", and "Ask the agent for more".
- **An ai-lite transport** (`src/agent/agentStudioTransport.ts`) calls the Agent Studio agent `84e907c0-1046-48c6-8dd8-559d40527fc6` from the browser and translates its AI SDK 5 stream into the panel's protocol: `data-reasoning`, `data-agent-text`, `data-hits`, `data-more-hits` and `data-metadata` parts.

A fake mode (`dev:fake`) serves a fixture store and a scripted agent from a local server. It speaks the same trigger and protocol and evaluates the same rule definitions, so the client doesn't know which mode it's in.

## What I like

- **The trigger is real Algolia.** Agentic mode comes from ordinary query rules on the index, not from code. Their patterns and consequence can be tuned without a deploy, and the same rule fixes the broad query so a sentence still has useful facets.
- **The response decides the mode.** The client never classifies queries. It obeys `renderingContent.widgets.agenticSearch`, read in one place (`src/agent/trigger.ts`). Forcing a mode is a rule context, so even "Ask AI" goes through the response.
- **No server.** The browser talks to the index and the agent with a search-only key, like the Chat widget.
- **One small protocol, two backends.** The panel knows one trigger and five data parts. The fake and the Agent Studio transport both produce them, so the UI was built and tested offline and then pointed at a real agent unchanged.
- **ai-lite carries the hard parts.** `AbstractChat` handles the streaming state, aborting the previous request, regenerating and errors; `HttpChatTransport` and `parseJsonEventStream` handle the HTTP and the stream. The example adds a subscribable `ChatState` (about 60 lines) and the translation.
- **Stateless agent requests.** Every turn sends all the user queries and the current filters. There are no conversation IDs, no server memory, and nothing to resync after a reload or an abort. Follow-ups, filter changes, retries and "Ask for more" are all the same kind of request.
- **InstantSearch keeps working.** Facets, refinements, the search box and pagination are ordinary widgets on the broad query. Agentic mode is a layer on top, not a fork.
- **Cheap "Show more".** The candidates the agent found but didn't pick are already in the stream, so revealing them costs no request and no agent turn.
- **Accessibility from the start.** One hidden, debounced live region announces the outcome of each turn, never single tokens. Errors use `role="alert"`, and focus is handled on clear and "Show more".

## What I dislike

- **Facet counts don't match what's shown.** In agentic mode the sidebar counts come from the broad query, which matches thousands of products, while the agent shows 6. The spec asks for this, but users will read the counts as counts of the visible products. The same goes for anything else on the broad query, such as stats or pagination.
- **The broad query is noisy.** With every word optional, "give me a laptop for my kid" matches 6,121 products, and its top results are a hard drive and a fridge. The facets are useful mostly for their values, not their counts.
- **The trigger is a phrase list.** The rules fire on words like "give me", "which", "best" and "under". That's crude query understanding: "headphones under 100" goes to the agent, "kid laptop cheap" doesn't.
- **Turns are slow and every filter click pays for one.** A real turn takes 10 to 15 seconds. A filter change runs a regular search and an agent turn. Rapid filter changes are not batched or debounced; each one aborts the previous turn and starts a new one.
- **Filters are a request, not a constraint.** The agent receives the active filters as an "Active filters: …" line in the last user message, and its prompt tells it to apply them. It did in every test, but nothing enforces it.
- **"Ask for more" is a pseudo user query.** The trail shows "show me more options" as if you had typed it. The list of products already shown rides along only on that request: changing a filter right after it re-sends the turn without the list, so seen products can come back.
- **Leftover candidates aren't curated.** "Show more" reveals search-ranked records, not agent picks. For "laptop for my kid" that included a $3,399 workstation.
- **The reasoning block is partly written by the transport.** The model's own reasoning only streams when it decides to reason (`gpt-6-luna` skips it on simple prompts) and only without the completion cache. The "Searching …", "Found …" and "Picked …" lines describe tool calls. They are accurate, but they aren't the model's thinking.
- **The panel shows only the latest turn.** Earlier answers are dropped on screen as well as in the request. That fits "search with refinements", but it isn't a conversation you can scroll back through.
- **A brief idle flicker on aborts.** After `stop()` the panel is idle for a moment before the queued request starts, because ai-lite runs requests one after another.

## Hacks and shortcuts in the demo

| Hack | Where | Why it exists | What it would need for real |
| --- | --- | --- | --- |
| The trigger is a custom key under `widgets` | `server/rules.mjs`, `src/agent/trigger.ts` | A rule's `renderingContent` only accepts `facetOrdering`, `redirect` and `widgets`; the engine stores and returns any key under `widgets` | An agreed, documented widget key, ideally typed in the API and the library |
| Phrase patterns decide "agentic" | `AGENTIC_PHRASES` in `server/rules.mjs` | Stand-in for query understanding | Real query classification, or rules curated per customer |
| POC rule contexts `agentic-search-poc-auto` / `-agent` | `server/rules.mjs`, `src/agent/useAgenticSearch.ts` | Modes as rule contexts | Contexts or a parameter the product owns, and rules created for the customer (for example by Agent Studio, as it does for the result card) |
| The client picks the facets | `PRESET.facets` in `src/backend.ts` | The index's own facet ordering includes the raw `price` facet | Index configuration, or `facetOrdering` in the rule consequence |
| Stream translation in the client | `src/agent/agentStudioTransport.ts` | Agent Studio streams AI SDK parts (text, reasoning, tool calls), not the panel's `data-*` parts | Keep it as a library transport, or render the native parts directly (see below) |
| Filters and "already shown" as message text | `toAgentStudioMessages` | The completion request's `algolia.searchParameters` shape isn't documented, so I didn't use it | Enforce filters through the request, or scope the agent's search tool |
| Repeated user messages with no assistant turns, memory off | `toAgentStudioMessages` | The stateless contract | Confirm this shape is supported, or move to Agent Studio conversations |
| `cache=false` on every completion | `AgentStudioTransport` | Cached replays drop reasoning and arrive as one chunk | Caching that keeps reasoning, or accept the cost |
| Deep import `instantsearch.js/es/lib/ai-lite` | `src/agent/` | ai-lite isn't public API | Expose it, or build the feature inside the library |
| The public search key, app and index in code | `src/backend.ts` | Demo setup, same key as the showcase | Configuration per customer |

## Incompatibilities

- **The stream formats differ.** Agent Studio's `ai-sdk-5` stream has `reasoning-*`, `text-*` and tool-call chunks. The picked products arrive as an `algolia_grouped_results` tool input of `objectID`s, and the full records come from earlier search-tool outputs. The panel's protocol is custom data parts; the transport translates between them.
- **The grouped-results tool is richer than the panel.** Its input has `intro`, group `title`s and a `why` per product. The POC flattens it to one list and drops the per-product reasons.
- **InstantSearch has no place for agent state.** The helper holds one query per index. The conversation and the picks live outside it, so they get no routing, no server-side rendering, no `uiState`, and no `insights`. Other widgets can't react to them.
- **The search box is shared.** In agentic mode a submit must become a follow-up instead of a search. The POC owns the search box to do this. In the library this needs either a dedicated widget or `searchBox`'s existing `queryHook(query, search)` option, which can route a submit elsewhere.
- **Types.** `renderingContent.widgets.agenticSearch` isn't in the `instantsearch.js` result types. The POC reads the response as `unknown` and checks its shape.
- **ai-lite gaps** (documented in `packages/instantsearch.js/CLAUDE.md`): no data-part schema validation, no `finishReason`, no tool approval. The POC checks shapes by hand.
- **Only React.** The POC is a React app. The library would need the same behaviour in JS and Vue.

## Two directions for the agent stream

1. **Keep the panel's protocol and translate** (what the POC does). The translation lives in a client-side transport, so no backend is needed. The panel stays simple and testable against a fake, but the transport has to track Agent Studio's tool names and output shapes.
2. **Render Agent Studio's native stream.** Render `reasoning` and `text` parts directly, and treat the grouped-results tool call as "the agent's picks", reusing the Chat widget's grouped-results parsing and UI in `instantsearch-ui-components`. There's less translation, and it picks up the per-product reasons for free, but the panel becomes specific to Agent Studio.

For a library widget I'd go with the second, keeping a thin transport only for what Agent Studio doesn't provide, such as leftover candidates.

## Steps for a real implementation

1. **Settle the trigger.** Query rules already work: agree on the widget key (the spec itself has `agentic` and `agenticSearch`), what it carries (`agentId`, possibly options), and who creates the rules. Agent Studio already creates per-agent rules for the result card, so it could create these too, with patterns tuned per customer or replaced by query classification.
2. **Choose the stream approach** (the two directions above), and agree on how the agent marks its picks. The grouped-results tool works today.
3. **Make filters a hard constraint.** Pass them as search parameters on the completion request, or scope the agent's search tool, instead of prompt text. Confirm the request shape with the Agent Studio team.
4. **Decide the conversation model:** stateless query lists, or Agent Studio conversations with memory. This also decides how "Ask for more" excludes products it already showed.
5. **Build a connector in `instantsearch.js`,** for example `connectAgenticResults`. It would:
   - add the mode's rule context to the search, as the result card connector does with `getWidgetSearchParameters`;
   - read the trigger from `results.renderingContent`;
   - own an ai-lite `Chat` and its transport;
   - expose a render state: mode, queries, status, reasoning, answer, picks, leftovers;
   - expose methods: `followUp`, `retry`, `stop`, `reset`, `showMore`, `askForMore`, `setMode`;
   - route search-box submits to follow-ups, through `queryHook` or a dedicated search box.

   Then wrap it for React and Vue, per the repo's cross-flavor rule, and add common tests in `tests/common/connectors`.

6. **Put the markup in `instantsearch-ui-components`.** Reuse the Chat widget's reasoning and grouped-results components (with titles and per-product reasons) and the hits layout, plus `ais-*` classes and themes in `instantsearch.css`.
7. **Decide what the broad-query widgets show in agentic mode.** Counts that match the picks, a clear label, or nothing.
8. **Insights.** The agent's search-tool output includes one `queryID` per search. Use them for click and conversion events on agent picks, and decide how the agent and broad queries are attributed.
9. **Cost and latency.** Debounce filter changes before re-asking the agent. Set a caching policy that keeps reasoning. Design for first output arriving within a couple of seconds, and for timeouts and rate limits.
10. **State and URLs.** Decide whether the mode, or the conversation, belongs in `uiState` and routing, and what server-side rendering returns for an agentic query.
11. **Accessibility, i18n and docs.** Keep the debounced live region pattern, make every string translatable, and write docs for the trigger contract and the widget.

## Gotchas found while building

- **Rules and `renderingContent`.** A rule consequence's `renderingContent` rejects unknown top-level keys ("Expected: facetOrdering, redirect, widgets"), but anything under `widgets` is stored and returned as is.
- **Stable function props.** Widget options passed to react-instantsearch hooks are compared by value, and functions by reference. An inline `transformItems` re-created a widget on every render, which caused an infinite search loop (about 360 searches per second). Function props must be stable.
- **String facets.** The helper sends `facets` as a plain string, not an array, on disjunctive-facet requests.
- **Encoded params.** The REST multi-query endpoint wants `params` as a URL-encoded string; the JS client hides this.
- **Publishing.** A new Agent Studio agent is a draft. Completions fail with "Agent is not published" until `POST /1/agents/{id}/publish`.
- **Adaptive reasoning and the cache.** `gpt-6-luna` decides per prompt whether to reason, so simple prompts often stream no reasoning even with `sendReasoning` on. A cached completion never has reasoning.
