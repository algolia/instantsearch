# POC — Chat as a Result Card

A single-file, standalone proof of concept for injecting a chat "instant answer" card
**inside the PLP hits grid**, built on `instantsearch.js` + Agent Studio.

## How to run

No build step. Everything is loaded from CDN (published `instantsearch.js@4.106.0` UMD,
`algoliasearch` lite UMD, satellite CSS theme).

```sh
# from this folder — any static server works
npx serve .
# or just open index.html directly in a browser (file:// works too,
# the Agent Studio endpoint has permissive CORS)
```

Data: the public demo app `latency` / `instant_search`, and the shared demo
Agent Studio agent used by the other instantsearch examples
(`eedef238-5468-470d-bc37-f99fa741bd25`).

The page loads with a pre-filled question-like query so the card triggers immediately.

## The questions this POC answers

### 1. Is the result card the same widget as chat, or a different one?

Both variants are implemented side by side (switch in the left panel):

| | Approach A — reuse the `chat` widget | Approach B — custom card on `connectChat` |
|---|---|---|
| Code | ~30 lines of config + ~10 lines CSS | ~200 lines of bespoke UI code |
| How | custom `layout` template (messages + prompt, no header), `type: 'chatCard'`, `persistence: false` | headless connector render state → own DOM: streamed answer, product chips from tool outputs, suggestion chips, one-line input |
| Free stuff | markdown, tool carousels, error/retry, loader, feedback, stick-to-bottom | streaming/state machine, transport, `turnContext`, suggestions extraction — everything visual is DIY |
| Feels like | a mini chat panel | an "answer card" |

**Verdict:** the *engine* is the same either way — `connectChat` provides transport,
streaming, tools, and context, and both cards coexist with the main chat by using a
different `type` (renderState key) and `persistence: false`. The choice is purely the
UI shell. Neither "copy the whole widget code" nor "pile conditions into the existing
widget" is needed: the clean productization is a **compact card layout preset**
(like `chatInlineLayout` / `chatOverlayLayout` today) plus a small amount of
card-specific chrome, shipped in instantsearch itself so it's an option for every
customer rather than bespoke work.

### 2. Follow-up button that opens a chat?

Both cards have **"Continue in full chat →"**. It works today with public APIs only:

```js
main.setMessages([...cardMessages]); // copy the card conversation into the main chat
main.setOpen(true);                  // open the overlay chat
```

Two caveats discovered while building this (both worth fixing for productization):

- `search.renderState[index].chatCard.messages` is **stale during streaming** —
  chat re-renders happen inside the widget without refreshing the shared render
  state snapshot. The POC captures live messages from the card's own render
  callback instead. A real handoff API should not require this.
- The two chat instances have different conversation ids. The transport is stateless
  (full history is sent each turn) so the handoff works, but feedback/analytics
  attribution would want a first-class "transfer conversation" notion.

### 3. Condition defined on the backend?

The trigger engine supports four modes:

- **Backend rule** — the idiomatic Algolia mechanism: a Rule with a `userData`
  consequence, read from `results.userData`. The demo index has no such Rule, so the
  POC evaluates a *simulated* rules table with the exact same shape
  (`{ chatResultCard: { position, mode } }`) and honors a real
  `results.userData[].chatResultCard` if the index ever returns one — including a
  card `position` override from the rule.
- **Frontend heuristic** — query "looks like a question" (length + question words / `?`).
- **Always** / **Manual** — for playing around.

The card shows a badge with the trigger reason; the left panel shows the live verdict.

**Takeaway:** no new backend API is needed for a v1 — Rules + `userData` is enough,
and it gives merchandisers control per query/context/segment.

*Is auto-trigger good enough?* Search-as-you-type means the evaluation must be
debounced (700 ms here) and auto-asks deduplicated per question, otherwise the agent
gets spammed on every keystroke. That is handled in the POC and worked fine in testing.

### 4. Is the "instant response" better with PLP context?

`connectChat` already supports ambient context via the `context` option, sent as
`messages[last].metadata.turnContext`. The POC sends:

```json
{
  "page": "product-listing-page",
  "query": "…",
  "activeFilters": "brand:Apple",
  "resultCount": "1090",
  "topResults": "MacBook Air | MacBook Pro | …"
}
```

The Agent Studio backend accepts it and demonstrably uses it (verified: with
`brand:Apple` in context, the agent answers about MacBooks without being asked).

Use the **Compare lab** (left panel) to stream the same question twice — with and
without context — side by side, with timings. `cache=false` is used so both requests
bypass the completion cache. Judge for yourself, but in testing the with-context answer
is consistently more grounded in what the user is actually looking at.

## Code map (all in `index.html`)

| Section | What it shows |
|---|---|
| `APPROACH A` block | `chat` widget as a card: custom `layout` template, `type`, `persistence: false`, `context` |
| `APPROACH B` block | headless `connectChat` renderer: streamed text, tool-output product chips, suggestions, own input |
| `Trigger engine` block | simulated backend rules + real `userData` support, heuristic, debounce, dedupe |
| `askCards` / `handoffToFullChat` | instant response + conversation handoff to the overlay chat |
| `Compare lab` block | raw `completions` calls (ai-sdk-5 SSE parsing) with/without `turnContext` |

## Caveats

- Uses the shared public demo agent — answers are generic e-commerce, and rate-limited
  (100 req/min); the debounce + dedupe keeps usage low.
- `persistence: false` on the cards is required: session persistence is keyed by
  `agentId`, so two persistent chats with the same agent would share storage.
- The `chat` widget logs a "not yet stable" warning in dev builds — expected.
