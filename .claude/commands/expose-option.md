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

This is a checklist for a cross-flavor option rollout. The connector is the single source of truth; React and Vue only *wrap* it, so do the connector first, then the wrappers.

## Steps

1. **Scope the contract first.** Read the connector `packages/instantsearch.js/src/connectors/<name>/connect<Pascal>.ts` and its JS widget `packages/instantsearch.js/src/widgets/<name>/<name>.tsx`. Confirm the option doesn't already exist and settle the exact semantics + the option's type signature. This is the contract every flavor must match.

2. **Connector first** (in `packages/instantsearch.js`):
   - Add the option to the connector's widget-params type with a TSDoc comment.
   - Implement the behavior in the lifecycle (`init`/`render`/`getWidgetSearchParameters`/etc.).
   - Surface it on the **typed render state** if consumers need it (untyped render state is an oxlint error).
   - Thread it through the JS widget. Keep it framework-agnostic — no React/Vue/DOM-framework code in the connector.

   For a presentational-only variant, **reuse the existing connector** with a distinct `$$widgetType` — never fork connector logic.

3. **If the option changes shared markup/layout** (not just behavior), update the shared `create<Name>Component` in `packages/instantsearch-ui-components` *before* wiring the flavors — its output is the contract they consume.

4. **Thread it through the wrappers** (independent of each other once the connector is settled):
   - **React** — the hook `packages/react-instantsearch-core/src/connectors/use<Pascal>.ts` and the component `packages/react-instantsearch/src/widgets/<Pascal>.tsx`, kept in sync and typed.
   - **Vue** — `packages/vue-instantsearch/src/components/<Pascal>.{vue,js}` (and `src/mixins/` if wiring lives there), working for **both Vue 2 and Vue 3**.

5. **Tests.** Cross-flavor behavior → add/extend `tests/common/connectors/<name>/` (or `.../widgets/<name>/`) and register it in each flavor's `common-*.test.*` (see `tests/common/README.md`); flavor-specific assertions stay in each package's co-located `__tests__/`. If browser-level behavior is affected, add an e2e spec (see `.claude/rules/e2e.md`).

6. **Verify.** Confirm all three flavors expose the same option with consistent naming/types, then:
   ```bash
   yarn jest packages/instantsearch.js/src/connectors/<name>
   yarn jest <the react/vue paths you touched>
   yarn type-check
   yarn lint:changed
   ```
   (Or run `/preflight`.)

## Notes

- Why this order: the connector is the contract; React and Vue only *wrap* it, so they're independent of each other and safe to do once the connector is settled.
- Don't hand-edit changelogs (Ship.js generates them). Commit message: `feat(<widget>): add <optionName> option`.
