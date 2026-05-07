# POC — Reasoning content rendering

Self-contained proof-of-concept for [`specs/rfcs/0001-reasoning-content.md`](../../specs/rfcs/0001-reasoning-content.md).

## What's in here

- `index.html` — a single-file demo. Open it in any browser. Click **Run scenario** to play a mocked AI-SDK 5 stream that emits reasoning deltas, tool calls and final text.
- The HTML inlines the **same class names** (`ais-ChatMessageReasoning*`, `ais-ChatMessageLoader*`) and the **same `summarizeReasoning` logic** that ship in:
  - `packages/instantsearch-ui-components/src/components/chat/ChatMessageReasoning.tsx`
  - `packages/instantsearch-ui-components/src/components/chat/ChatMessageLoader.tsx`
  - `packages/instantsearch-ui-components/src/lib/utils/reasoning.ts`
  - `packages/instantsearch.css/src/components/chat/_chat-message-reasoning.scss`

## Running it

```bash
open /Users/ferencz.andras/Documents/GitHub/instantsearch/poc/reasoning/index.html
# or
npx serve /Users/ferencz.andras/Documents/GitHub/instantsearch/poc/reasoning
```

No build step needed.

## Things to look at

1. Toggle **showReasoning** off → the same stream falls back to today's behaviour: a generic "…" loader, no thinking panel.
2. Toggle **showReasoning** on → the loader caption tracks the current substitute label live; the reasoning panel auto-opens while streaming and collapses on done with a "Thought for N s" timer.
3. Switch **scenario** to *Raw chain-of-thought (DeepSeek-R1-style)* — notice the body redacts itself when the categorizer detects an API-key pattern.
4. Try **visibility = expanded / collapsed / hidden** — covers the three deployment policies described in the RFC.

## Mapping the demo back to production

| In the demo (`index.html`)       | In the package                                                                                  |
|----------------------------------|-------------------------------------------------------------------------------------------------|
| `summarizeReasoning()`           | `lib/utils/reasoning.ts` → `summarizeReasoning`                                                 |
| `categorizeReasoning()`          | `lib/utils/reasoning.ts` → `categorizeReasoning`                                                |
| `categorizeFromToolCall()`       | `lib/utils/reasoning.ts` → `categorizeFromToolCall`                                             |
| `renderReasoning()`              | `components/chat/ChatMessageReasoning.tsx`                                                      |
| `renderLoader()`                 | `components/chat/ChatMessageLoader.tsx`                                                         |
| `applyChunk()`                   | `instantsearch.js/src/lib/ai-lite/abstract-chat.ts` (`processStreamWithCallbacks`) — production |
| Mocked SCENARIOS                 | Real `data: { type: "reasoning-start" \| "reasoning-delta" \| ... }` SSE events                  |
