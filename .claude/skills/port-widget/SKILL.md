---
name: port-widget
description: Port or introduce an InstantSearch widget or connector-driven feature across this monorepo's JavaScript, React, and Vue flavors. Use when the task is to add a missing wrapper around an existing connector, bring a widget from one flavor to another, or implement a new shared widget end-to-end in `instantsearch.js`, `react-instantsearch`, and `vue-instantsearch`. Triggers include requests like "port X to vue", "add Y to react-instantsearch", "make Z available in all flavors", or "implement the missing InstantSearch wrapper for this connector".
---

# Port InstantSearch Widgets Across Flavors

## Start with the audit

Always run the audit before editing — it tells you what is actually missing,
catches variant widgets, and points to the right placeholder strings to remove.

```bash
# What porting work is open across the whole repo?
python3 .claude/skills/port-widget/scripts/audit_widget_coverage.py --gaps

# Detailed scorecard for one widget (use the kebab-case directory name)
python3 .claude/skills/port-widget/scripts/audit_widget_coverage.py <widget>
```

Pass `--repo /path/to/instantsearch` if your CWD is outside this repo.

The audit's `Notes` section already calls out:

- variant widgets (e.g. `menu-select` reuses `connectMenu`/`useMenu`)
- special widgets that live outside the normal layout (e.g. `dynamic-widgets`
  exports its React component from `react-instantsearch-core/src/components/`)
- Vue placeholder strings still throwing `"X is not supported in Vue InstantSearch"`
- recommendation/chat widgets that need the `Hits.js` render-function pattern in Vue

Trust those notes — they encode pitfalls that have already burned past porting work.

## Current gap shape (as of this skill version)

Useful to know which patterns dominate so you can plan from the right precedent.
Re-run `--gaps` to see live state.

- **React widgets missing**: `numeric-menu`, `menu-select` (variant of `menu`),
  `rating-menu` (needs hook + widget).
- **Vue components missing**: the recommendation/chat family —
  `chat`, `filter-suggestions`, `frequently-bought-together`, `looking-similar`,
  `related-products`, `trending-facets`, `trending-items`, plus an
  `autocomplete` test-only gap. All have connectors and React widgets already;
  Vue is the only missing flavor.
- **Test-suite-only gaps**: several established widgets (`hits`, `search-box`,
  `clear-refinements`, etc.) lack `tests/common/connectors/<widget>/`. Low
  priority — add only when changing the connector contract.

## Layer map

- Connector: `packages/instantsearch.js/src/connectors/<widget>/connect<Pascal>.ts`
- JS widget: `packages/instantsearch.js/src/widgets/<widget>/<widget>.tsx` (or `.ts` for `dynamic-widgets`)
- React hook: `packages/react-instantsearch-core/src/connectors/use<Pascal>.ts`
- React widget: `packages/react-instantsearch/src/widgets/<Pascal>.tsx`
- Optional React UI: `packages/react-instantsearch/src/ui/<Pascal>.tsx`
- Vue wrapper: `packages/vue-instantsearch/src/components/<Pascal>.vue` or `.js`
- Shared widget tests: `tests/common/widgets/<widget>/`
- Shared connector tests: `tests/common/connectors/<widget>/`

## Variant widgets

Some widgets reuse another widget's connector with different defaults or UI:

| Variant         | Reuses              | Set `$$widgetType` to |
| --------------- | ------------------- | --------------------- |
| `menu-select`   | `connectMenu` / `useMenu`   | `ais.menuSelect`   |
| `range-input`   | `connectRange` / `useRange` | `ais.rangeInput`   |
| `range-slider`  | `connectRange`              | `ais.rangeSlider`  |

For these, the audit will show `no` on connector/hook rows by design. Skip
connector/hook creation, import the upstream hook directly, and only port the
wrapper plus wrapper tests.

## Workflow

1. **Scope the work.** Run `--gaps` to confirm what's missing, then pick:
   - Missing wrapper, existing connector → keep the connector API unchanged and
     port only the wrapper plus wrapper tests.
   - Variant widget → skip connector/hook creation; reuse the upstream hook and
     set a distinct `$$widgetType`.
   - Missing connector or changed render state → start in `instantsearch.js`,
     then update every flavor and both common test suites.
   - Recommendation, chat, or filter-suggestions widget being ported to Vue →
     read the [Vue render-function precedents](references/vue-flavor.md) before
     designing the wrapper, since these all share the `Hits.js` pattern.
2. **Pick a precedent.**
   - Open the [precedent picker](#precedent-picker) below and clone the closest
     widget that already exists in the target flavor.
   - Reuse the same prop names, slot or component escape hatches,
     `$$widgetType`, and test style.
3. **Build from the bottom up.** Registration entry points:
   - Connectors: `packages/instantsearch.js/src/connectors/index.ts`
   - JS widgets: `packages/instantsearch.js/src/widgets/index.ts`
   - React hooks: `packages/react-instantsearch-core/src/index.ts`
   - React widgets: `packages/react-instantsearch/src/widgets/index.ts`
     (`packages/react-instantsearch/src/index.ts` re-exports it for you)
   - Vue widgets: `packages/vue-instantsearch/src/widgets.js`
     (`src/instantsearch.js` and the plugin re-register from there)
4. **Choose the right sharing model.**
   - JS and React: prefer `instantsearch-ui-components` when the markup can be
     shared.
   - React: create `src/ui/<Pascal>.tsx` whenever the widget has no shared
     factory in `instantsearch-ui-components`. This includes simple widgets
     like `MenuSelect` (a plain `<select>`) — `src/ui/` is for all
     React-rendered markup, not only complex cases.
   - Vue: use `.vue` SFCs for slot-heavy markup and `.js` render functions with
     `renderCompat` when reusing `instantsearch-ui-components`.
5. **Wire tests before finishing.**
   - Update `tests/common/widgets/<widget>/` whenever the wrapper behavior changes.
   - Update `tests/common/connectors/<widget>/` whenever connector params or
     render state change.
   - Register the suite in each flavor's `common-widgets.test.*` and
     `common-connectors.test.*`.
   - Replace any `throw new Error('X is not supported in ...')` placeholder
     with real setup code. The audit prints the exact placeholder string —
     watch for irregular names like `RelatedProduct` (singular) for
     `related-products`.
   - Remove the corresponding `skippedTests` entry in `testOptions` for that widget.
   - For React: always add the widget to the switch in
     `packages/react-instantsearch/src/widgets/__tests__/__utils__/all-widgets.tsx`
     with the required minimum props.
6. **Check examples only when the widget is user-facing.**
   - Search existing examples first. Recommendation, chat, and query-suggestion
     widgets already live in getting-started or query-suggestions examples,
     not only the e-commerce apps.
   - Add to `examples/*/e-commerce` only when the widget fits the shared
     storefront UX or existing Playwright coverage.

## Precedent picker

| Porting target | Best precedents to clone from |
| --- | --- |
| JS widget, shared UI | `hits`, `related-products`, `trending-items`, `filter-suggestions` |
| JS widget, legacy templates + CSS helpers | `refinement-list`, `menu`, `pagination` |
| React widget with shared UI factory | `Hits.tsx`, `RelatedProducts.tsx`, `TrendingItems.tsx`, `FilterSuggestions.tsx` |
| React widget with React-only UI in `src/ui` | `SearchBox.tsx`, `RangeInput.tsx`, `RefinementList.tsx`, `Menu.tsx`, `SortBy.tsx`, `HitsPerPage.tsx` |
| React variant of another widget | `RangeInput.tsx` (uses `useRange`); for `MenuSelect` clone this pattern and use `useMenu` |
| Vue SFC, slot-heavy template | `RefinementList.vue`, `Menu.vue`, `Pagination.vue` |
| Vue render-function wrapper around shared UI | `Hits.js`, `Highlighter.js`, `DynamicWidgets.js`, `Feeds.js` |

## Reminders

- Keep `$$widgetType` aligned across flavors.
- Do not invent new Vue patterns; match `createWidgetMixin`, `createSuitMixin`,
  scoped slots, and `renderCompat`.
- Do not add memoization hooks in React unless an adjacent widget uses them for
  the same reason.
- `chat` is now available in UMD; no special exclusions apply.
- Don't trust grep for placeholder names — the audit script knows the irregular
  ones (e.g. `RelatedProduct` vs `RelatedProducts`).

## References

- JS wrappers: [references/js-flavor.md](references/js-flavor.md)
- React wrappers: [references/react-flavor.md](references/react-flavor.md)
- Vue wrappers: [references/vue-flavor.md](references/vue-flavor.md)
- Testing and examples: [references/testing.md](references/testing.md)
