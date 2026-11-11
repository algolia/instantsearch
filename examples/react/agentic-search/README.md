# Agentic search POC (React InstantSearch)

A clickable proof of concept of InstantSearch in an agentic mode. A query that regular search judges "bad" hands off to an agent, which streams its reasoning, an answer and the products it picked. Follow-ups and filter changes re-ask the agent.

```sh
yarn install   # from the repo root
yarn workspace example-react-instantsearch-agentic-search dev        # real index + Agent Studio agent
yarn workspace example-react-instantsearch-agentic-search dev:fake   # scripted, offline
```

## Backends

The client is the same for both; it reads one trigger and one agent protocol (see "How it works").

- **Agent Studio** (default). No server: the browser talks to Algolia directly with the public search-only key, like the Chat widget.
  - Regular search goes to the `instant_search` index in the `latency` app (Best Buy products).
  - The agentic trigger comes from two **query rules** on that index (`server/rules.mjs`), saved with `ALGOLIA_ADMIN_API_KEY=… yarn setup-rules`. They only fire for searches that send the POC's rule contexts, so other users of the index are unaffected.
  - Agent turns go to the published agent "Agentic search POC [instantsearch, do not delete]" (`84e907c0-1046-48c6-8dd8-559d40527fc6`), named by the rule. It has the Algolia Search tool on `instant_search` and the grouped-results tool; memory is off because every request carries the whole conversation. `src/agent/agentStudioTransport.ts`, an ai-lite transport, translates its AI SDK 5 stream into the agent protocol: search tool calls and hit counts, and the model's own reasoning, become `data-reasoning`; the grouped-results tool's picked `objectID`s become `data-hits` (filled in from the search results, or `getObjects`); the remaining search results become `data-more-hits`; text becomes `data-agent-text`. The active filters are an "Active filters: …" line on the last user message; the agent's instructions say to apply them. Completions run uncached, because a cached replay has no reasoning.
- **Fake** (`VITE_AGENTIC_BACKEND=fake`). A fixture shoe store and a deterministic scripted agent (`server/`), mounted in the Vite dev server; `yarn server` runs it on its own on port 3001. It evaluates the same rule definitions as the real index, so both backends trigger alike.

## Try it

| Agent Studio | Fake | What happens |
| --- | --- | --- |
| `laptop` | `blue shoes` | Regular search: keyword queries stay regular in Auto. |
| `give me a laptop for my kid` | `give me blue shoes` | Agentic mode: reasoning, then the answer and hits. |
| then `from Apple instead` | then `in velours` | Follow-up: the agent gets both queries. |
| toggle a facet | toggle a facet | The same queries are re-sent with the new filters snapshot. |
|  | `recommend flaky boots` | The first attempt fails with an error and a Retry button; the retry succeeds. |

Under the agent's picks, **Show more** reveals the leftover candidates six at a time, instantly and without a request; they are in search order, not chosen by the agent. Once they run out, **Ask the agent for more** sends a "show me more options" turn with the products already shown excluded (repeats the real agent still picks are dropped).

The × in the search box (or Escape on an empty input) clears the query and ends the conversation; "New search" in the agent panel does the same. What you type next is a new search. A real agent turn takes around 10 to 15 seconds.

The mode switch above the search box picks **Auto** (natural-language queries go to the agent), **Search** (always regular) or **Ask AI** (always the agent). Each mode is a rule context: `agentic-search-poc-auto` fires the rule when the query contains one of the phrases in `server/rules.mjs` ("give me", "which", "under", …), `agentic-search-poc-agent` fires it for every query, and Search sends neither. The client only switches when the response says so, and a response without the trigger ends agentic mode.

## How it works

- **Trigger.** The search response carries `renderingContent.widgets.agenticSearch: { enabled: true, agentId }` (or `stream` for the fake). It sits under `widgets` because a rule's `renderingContent` only accepts `facetOrdering`, `redirect` and `widgets`. The same rule adds `removeWordsIfNoResults: 'allOptional'`, so the broad query behind a sentence still has useful facets. The client reads the trigger in one place, `src/agent/trigger.ts`. The regular hits are not shown in agentic mode; facets still come from the broad query.
- **Agent request.** Every turn sends all user queries, the current filters, and, for "Ask for more" only, the `objectID`s already on screen (`exclude`). Nothing is kept server-side. A new turn aborts the previous stream. With the fake, the request is `POST /agent/stream` with `{ queries, filters, exclude? }`.
- **Stream.** An ai-lite UI message stream: `start`, then `data-reasoning` / `data-agent-text` / `data-hits` / `data-more-hits` / `data-metadata` chunks, then `finish`. Hits are appended in arrival order, without deduplication.
- **Client.** `src/agent/chat.ts` subclasses ai-lite's `AbstractChat` (`instantsearch.js/es/lib/ai-lite`) with a state React subscribes to; `src/agent/transports.ts` picks the transport the trigger asks for. `src/agent/useAgenticSearch.ts` holds agentic mode in React state. Nothing of the conversation goes into the helper, the URL or the search requests.
- **Accessibility.** A hidden, debounced live region announces the outcome of each search or agent turn, never individual tokens. Errors use `role="alert"`.

Not covered: Vue/JS flavors, insights, persistence, conversation IDs, tool approval.
