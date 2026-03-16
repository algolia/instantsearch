---
name: port-widget
description: Port or introduce an InstantSearch widget or connector-driven feature across this monorepo's JavaScript, React, and Vue flavors. Use when the task is to add a missing wrapper around an existing connector, bring a widget from one flavor to another, or implement a new shared widget end-to-end in `instantsearch.js`, `react-instantsearch`, and `vue-instantsearch`. Triggers include requests like "port X to vue", "add Y to react-instantsearch", "make Z available in all flavors", or "implement the missing InstantSearch wrapper for this connector".
---

# Port InstantSearch Widgets Across Flavors

## Start with the repo audit

- Run `python3 scripts/audit_widget_coverage.py <widget-kebab-name>` from this skill folder before editing.
- Use `--repo /path/to/instantsearch` if your current working directory is not inside the InstantSearch repo.
- Treat placeholder Vue failures in `packages/vue-instantsearch/src/__tests__/common-widgets.test.js` or `common-connectors.test.js` as evidence that the connector exists but the Vue wrapper still needs work.

## Layer map

- Connector: `packages/instantsearch.js/src/connectors/<widget>/connect<Pascal>.ts`
- JS widget: `packages/instantsearch.js/src/widgets/<widget>/<widget>.tsx`
- React hook: `packages/react-instantsearch-core/src/connectors/use<Pascal>.ts`
- React widget: `packages/react-instantsearch/src/widgets/<Pascal>.tsx`
- Optional React UI: `packages/react-instantsearch/src/ui/<Pascal>.tsx`
- Vue wrapper: `packages/vue-instantsearch/src/components/<Pascal>.vue` or `.js`
- Shared widget tests: `tests/common/widgets/<widget>/`
- Shared connector tests: `tests/common/connectors/<widget>/`

## Workflow

1. Decide the scope.
   - Existing connector, missing wrapper: keep the connector API unchanged and port only the wrapper plus wrapper tests.
   - Missing connector or changed render state: start in `instantsearch.js`, then update every flavor and both common test suites.
   - Vue port for a newer recommendation, chat, or filter-suggestions feature: inspect `Hits.js`, `Highlighter.js`, `DynamicWidgets.js`, and `util/vue-compat.js` before designing the wrapper.
2. Match a real precedent.
   - Pick one close widget in the target flavor and one close widget in another flavor.
   - Reuse the same prop names, slot or component escape hatches, `$$widgetType`, and test style.
3. Build from the bottom up.
   - Connector exports belong in `packages/instantsearch.js/src/connectors/index.ts` and `index.umd.ts`.
   - JS widget exports belong in `packages/instantsearch.js/src/widgets/index.ts` and `index.umd.ts`.
   - React hook exports belong in `packages/react-instantsearch-core/src/index.ts`.
   - React widget exports belong in `packages/react-instantsearch/src/widgets/index.ts`; `packages/react-instantsearch/src/index.ts` already re-exports widgets.
   - Vue exports belong in `packages/vue-instantsearch/src/widgets.js`; `src/instantsearch.js` and the plugin re-export and register from there automatically.
4. Choose the right sharing model.
   - JS and React: prefer `instantsearch-ui-components` when the markup can be shared.
   - React: create `src/ui/<Pascal>.tsx` only when the widget needs React-only concerns like refs, DOM event plumbing, or composition-heavy JSX.
   - Vue: use `.vue` SFCs for slot-heavy markup and `.js` render functions with `renderCompat` when reusing `instantsearch-ui-components`.
5. Wire tests before finishing.
   - Update `tests/common/widgets/<widget>/` whenever the wrapper behavior changes.
   - Update `tests/common/connectors/<widget>/` whenever connector params or render state change.
   - Register the suite in each flavor's `common-widgets.test.*` and `common-connectors.test.*`.
   - Remove any placeholder "not supported in Vue InstantSearch" branches when you finish a Vue port.
6. Check examples only when the widget is user-facing.
   - Search existing examples first. Recommendation, chat, and query-suggestion widgets already live in getting-started or query-suggestions examples, not only the e-commerce apps.
   - Add to `examples/*/e-commerce` only when the widget fits the shared storefront UX or existing Playwright coverage.

## Reminders

- Keep `$$widgetType` aligned across flavors.
- Do not invent new Vue patterns; match `createWidgetMixin`, `createSuitMixin`, scoped slots, and `renderCompat`.
- Do not add memoization hooks in React unless an adjacent widget uses them for the same reason.
- Check UMD behavior before exporting; `chat` is intentionally unavailable there.

## References

- JS wrappers: [references/js-flavor.md](references/js-flavor.md)
- React wrappers: [references/react-flavor.md](references/react-flavor.md)
- Vue wrappers: [references/vue-flavor.md](references/vue-flavor.md)
- Testing and examples: [references/testing.md](references/testing.md)
