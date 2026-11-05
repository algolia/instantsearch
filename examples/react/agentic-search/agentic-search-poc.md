# Agentic search POC

## Goal

Build a clickable React proof of concept of the full InstantSearch experience in an agentic mode. The user should be able to open a page, search, see a streamed agent response with results, ask follow-ups, change filters, and play around with it. It is a demo: the backend is fake, and the showcase is the only target.

Success criteria: a developer can run the showcase locally, type a query, watch the agent stream reasoning, answer, and hits, send a follow-up, change a filter, and see the result update.

## Scope

- **Location:** the React widget showcase (or a dedicated demo page inside it). React only. No changes to `instantsearch.js` connectors or to the `react-instantsearch` packages for the POC. Verify the showcase's location in the repo before starting.
- **Fake backend:** a small server that runs locally next to the showcase. It serves the regular search response and the agent stream.
- **Out of scope for the POC:** real agent/backend integration, Vue and vanilla JS flavors, analytics/insights, persistence across reloads, conversation IDs, tool approval, error recovery beyond a simple retry.

## Decisions

1. **Streaming library: ai-lite**, the hand-written UI layer in `packages/instantsearch.js/src/lib/ai-lite`. Do not add `ai` (Vercel AI SDK) to the showcase. Reason: the library ships ai-lite, not the AI SDK, so the POC should use the same stack it would ship with. Reference: `packages/instantsearch.js/CLAUDE.md` describes ai-lite and its gaps (no tool approval, no data-part schema validation, no `finishReason`).
2. **Stream format:** the ai-lite UI message stream (SSE with AI-SDK-style chunks), using custom data parts for agent events (see "Stream protocol"). Chosen encoding: custom data parts, not text parts with JSON inside, so each event type is distinct and typed on the client.
3. **Follow-ups are new requests, not messages on the open stream.** SSE is one-way, so each user turn is a new `POST` to the agent stream endpoint. Starting a new request aborts the previous stream with an `AbortController`.
4. **Follow-ups are stateless on the server.** The client sends the whole conversation as a list of user queries each time. Agent replies are not sent back.
5. **Filters are sent as a snapshot** of the currently active filters on each request, alongside the query list.
6. **Agentic state lives in React state in the showcase**, not in the InstantSearch helper and not in URL parameters. It is never sent to Algolia. Only the regular (broad) search goes to Algolia.
7. **Facets and filter options come from the broad query**, as the response fields define. The client renders them as-is.
8. **Hits from the agent carry `objectID`s** (the LLM picks them from its searches). The client renders them as-is and does not deduplicate.
9. **Errors and cancel:** ai-lite already has stop/abort handling (there are tool-cancellation tests for it). Reuse that. For the POC, show an error message with a retry button and nothing more.

## Trigger contract

The regular search response signals agentic mode under `renderingContent`:

```json
{
  "renderingContent": {
    "agentic": {
      "stream": "/agent/stream"
    }
  }
}
```

- When `renderingContent.agentic` is present, the showcase switches to agentic mode for that query. The regular search's hits are **not** shown (the original query is judged bad). Facets and filters still come from the regular response, as described in "Client behaviour".
- The fake backend returns this field for queries that match a configured "agentic" pattern (for example, anything containing "shoes"). Everything else behaves like normal search.
- Keep the field path in one constant in the showcase so it's easy to change later.

## Request to the agent stream

`POST {streamUrl}` with a JSON body:

```json
{
  "queries": ["give me blue shoes", "in velours"],
  "filters": {
    "color": ["blue"]
  }
}
```

- `queries`: every user query in the current conversation, in order. The first is the original search, the rest are follow-ups.
- `filters`: the active filters as a snapshot, keyed by attribute. Removing a filter in the UI drops it from the next request.
- Response: an ai-lite UI message stream (`text/event-stream`).

## Stream protocol

Use ai-lite's chunk types. Agent events are custom data parts. Proposed names and payloads:

| Part | Payload | Rendering |
| --- | --- | --- |
| `data-reasoning` | `{ text }` (may arrive in several chunks) | Reasoning block, streamed text |
| `data-agent-text` | `{ text }` | Agent answer block, streamed text |
| `data-hits` | `{ hits: [{ objectID, ...fields }] }` | Appended to the streamed hits list |
| `data-metadata` | optional, `{ ... }` | Not rendered in the POC |
| error | ai-lite error chunk | Error message and retry button |

- Encoding: each data part is a chunk `{ type: 'data-<name>', data: { ... } }`, matching ai-lite's `DataUIMessageChunk` (`packages/instantsearch.js/src/lib/ai-lite/types.ts`). The payload columns above are the contents of `data`. ai-lite does not validate data-part schemas, so the client should check the shape it reads.
- The stream ends with the ai-lite finish chunk.
- Hits are appended in arrival order. Do not deduplicate.
- Only the agent's selected hits are streamed and shown. The original query's hits are never displayed.

## Client behaviour

- **Mode switch:** when the regular response has `renderingContent.agenticSearch`, show the agent panel and start a stream for the current query list and filters.
- **Panel layout:** a reasoning block, an agent answer block, and a streamed hits list. The regular hits list is replaced by the agent panel. The search box, facets, and filters keep working.
- **Follow-up:** typing in the search box while in agentic mode adds the new text to the query list and starts a new request. It does not trigger a regular Algolia search.
- **Filter change:** toggling a facet value in agentic mode updates the filters snapshot and starts a new request with the same query list.
- **Facets and counts:** rendered from the broad query, as the response provides them. The agent does not change them.
- **Accessibility:** the streamed agent text and hits need a live-region announcement that doesn't fire on every token (use a debounced or separate region).

## Fake backend

- A small local server (Node, one command to run) that serves:
  - the regular search endpoint, returning a normal response, and a response with `renderingContent.agentic` for queries that match a pattern;
  - the agent stream endpoint, which takes the request body above and streams a scripted response.
- The scripted agent is deterministic for a given input, so the demo is repeatable. For example, given `queries` and `filters`, it emits:
  1. a few `data-reasoning` chunks,
  2. a `data-agent-text` chunk,
  3. `data-hits` chunks drawn from a fixture dataset, applying the filters,
  4. a finish chunk.
- Use the same fixture dataset for the regular search results.
- Add a small delay between chunks so the streaming is visible.

## Resolved questions

- **Trigger field:** `renderingContent.agentic.stream` (see "Trigger contract").
- **Data-part encoding:** custom `data-<name>` chunks (see "Stream protocol").
- **Showcase location:** a new page/route, not an existing one.
- **Hits:** only the agent's selected hits are shown. The original query's hits are never displayed.
