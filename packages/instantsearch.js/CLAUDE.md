# instantsearch.js (core / vanilla JS)

The core package. **Every connector lives here and is consumed by all flavors** — React hooks and Vue components wrap these. A behavior change usually belongs in a connector here, not in a flavor package.

## Layout

- `src/connectors/<name>/connect<Pascal>.ts` — framework-agnostic logic. Signature: `connect<Widget>(renderFn, unmountFn)` returns a widget factory. Owns state, lifecycle, and search-param mutations. Exported from `src/connectors/index.ts`.
- `src/widgets/<name>/<name>.tsx` — vanilla JS widget = connector + default template/rendering. Exported from `src/widgets/index.ts`.
- `src/components/` — the **JS flavor's Preact components** (the widgets' markup). This is the _legacy_ home for widget layout; newer widgets pull their layout from the shared `instantsearch-ui-components` package instead, and some components here are now thin wrappers that import from it. Add **new shared** markup to `instantsearch-ui-components`, not here.
- `src/lib/` — the InstantSearch runtime: lifecycle orchestration, routing, helper integration.
- `src/lib/ai-lite/` — hand-written reimplementation of the Vercel AI SDK's UI layer (`UIMessage` parts, the SSE chunk protocol, the `Chat` state machine `connectChat` drives). It replaced `ai@^5.0.18` in #6880 and tracks nothing upstream: AI SDK fixes land on the `ai@6` line and never reach us. **Before changing its semantics, diff the matching file under [`vercel/ai/packages/ai/src/ui`](https://github.com/vercel/ai/tree/main/packages/ai/src/ui)** — the auto-continue predicate silently missed vercel/ai#9944 (don't resend provider-executed tool turns) for months. Deliberate gaps: no tool-approval flow, no metadata/data-part schema validation, no `finishReason`.
- `src/types/` — public type definitions.

## Working here

```bash
yarn workspace instantsearch.js build      # rollup → esm + cjs + umd + .d.ts
yarn jest packages/instantsearch.js/src/connectors/<name>   # run one connector's tests (from repo root)
```

- Connectors return a typed render state — don't return untyped state (oxlint rule).
- A new widget that only varies presentation should **reuse an existing connector** (e.g. `menuSelect` reuses `connectMenu`) and set a distinct `$$widgetType`; don't fork the connector.
- Cross-flavor behavior is covered by `tests/common/connectors/<name>/`; flavor-agnostic logic tests go there, JS-specific ones stay in `__tests__/`.
