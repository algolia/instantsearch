---
description: Thread a new option on an existing connector through all three flavors (JS, React, Vue) + common tests
argument-hint: <connector> <optionName> [short description of what it does]
---

You are exposing a new option through the InstantSearch fan-out. The architecture is **connector (logic) → flavor wrapper → shared UI**, so the option is defined once in the connector and surfaced by each flavor.

**Input:** `$ARGUMENTS`
- First token = the connector (e.g. `connectRefinementList` or just `refinementList`).
- Second token = the new option name (e.g. `clearOnChange`).
- Remaining text = a short description of the behavior, if given.

If the connector or option name is missing or ambiguous, ask before changing files. If the behavior isn't specified, ask what the option should do — do **not** guess at semantics.

This command **orchestrates the flavor specialist agents**. You stay the coordinator: scope the change, delegate each layer to the right agent, and reconcile their output. Don't write the per-flavor code yourself unless an agent is unavailable.

## Steps

1. **Scope it yourself first (no delegation yet).** Read the connector `packages/instantsearch.js/src/connectors/<name>/connect<Pascal>.ts` and its JS widget `packages/instantsearch.js/src/widgets/<name>/<name>.tsx`. Confirm the option doesn't already exist and settle the exact semantics + the option's type signature. This shared contract is what you'll hand to each agent so they stay consistent.

2. **Connector first — dispatch `instantsearch-core-engineer`** (the single source of truth, blocks everything else). Have it:
   - Add the option to the connector's widget-params type with a TSDoc comment.
   - Implement the behavior in the lifecycle (`init`/`render`/`getWidgetSearchParameters`/etc.).
   - Surface it on the **typed render state** if consumers need it (untyped render state is an oxlint error).
   - Thread it through the JS widget. Keep it framework-agnostic — no React/Vue/DOM-framework code in the connector.

   Wait for this to finish and note the final option name, type, and render-state shape — the flavor agents depend on it.

3. **Then fan out the wrappers in parallel** — dispatch both in a single message so they run concurrently, giving each the exact contract from step 2:
   - **`react-instantsearch-engineer`** — thread the option through the hook `packages/react-instantsearch-core/src/connectors/use<Pascal>.ts` and the component `packages/react-instantsearch/src/widgets/<Pascal>.tsx`, kept in sync and typed.
   - **`vue-instantsearch-engineer`** — thread it through `packages/vue-instantsearch/src/components/<Pascal>.{vue,js}` (and its `src/mixins/` if wiring lives there), working for **both Vue 2 and Vue 3**.

   If the option changes **shared markup/layout** (not just behavior), dispatch `instantsearch-ui-components-engineer` to update the shared `create<Name>Component` *before* the flavor agents wire it up — its output is the contract they consume.

4. **Tests.** Cross-flavor behavior → add/extend `tests/common/connectors/<name>/` (or `.../widgets/<name>/`) and register it in each flavor's `common-*.test.*` (see `tests/common/README.md`); flavor-specific assertions stay in each package's co-located `__tests__/`. Each agent owns its own flavor's tests; you own the common-test contract. If browser-level behavior is affected, add an e2e spec (see `.claude/rules/e2e.md`).

5. **Reconcile + verify (you, after agents return).** Confirm all three flavors expose the same option with consistent naming/types, then:
   ```bash
   yarn jest packages/instantsearch.js/src/connectors/<name>
   yarn jest <react/vue paths the agents touched>
   yarn type-check
   yarn lint:changed
   ```
   (Or run `/preflight`.) If a check fails in one flavor, route the fix back to that flavor's agent rather than patching it yourself.

## Notes

- For a presentational-only variant, the core agent must **reuse the existing connector** with a distinct `$$widgetType` — never fork connector logic.
- Why this order: the connector is the contract; React and Vue only *wrap* it, so they're independent of each other and safe to run in parallel once the connector is settled.
- Don't hand-edit changelogs (Ship.js generates them). Commit message: `feat(<widget>): add <optionName> option`.
