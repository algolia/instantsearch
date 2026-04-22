# Vue Flavor (`vue-instantsearch`)

## Current patterns in this repo

- Slot-heavy SFCs: `RefinementList.vue`, `Menu.vue`, `Pagination.vue`
- Render-function wrappers around shared UI components: `Hits.js`, `Highlighter.js`
- Framework glue helpers: `mixins/widget.js`, `mixins/suit.js`, `util/vue-compat.js`

## Choose the wrapper shape deliberately

### Use a `.vue` SFC when

- the widget exposes multiple named slots
- the DOM structure is easiest to express in template syntax
- the closest existing widget is already an SFC

### Use a `.js` render function when

- the widget reuses `instantsearch-ui-components`
- the wrapper mostly adapts connector state into a shared UI factory
- the widget needs `renderCompat(...)` or lower-level vnode control

## Implementation rules

- Import connectors from `instantsearch.js/es/connectors/index`.
- Use `createWidgetMixin({ connector: ... }, { $$widgetType: 'ais.<camelName>' })`.
- Use `createSuitMixin({ name: '<Pascal>' })` for BEM classes. When the widget delegates all rendering to a shared `createXxxComponent` factory, the suit mixin's `suit()` method goes unused but the `classNames` prop it provides is still convenient. Pass `this.classNames` directly to the shared component's `classNames` prop (semantic keys like `{ root, container }`, not BEM keys).
- Expose connector params through a computed `widgetParams()` object.
- When reusing shared UI factories, wrap the render function with `renderCompat(...)` and map `this.classNames` into the `classNames` prop expected by the shared component.
- Prefer `getScopedSlot` or `getDefaultSlot` helpers over direct slot access when matching render-function components.
- In render-function callbacks that reference connector state (e.g. `onSubmit`, `onInput`), read from `this.state.xxx` instead of destructured locals. Vue batches re-renders, so destructured values become stale between synchronous user interactions (type then click).

## Registration checklist

- Export the component from `packages/vue-instantsearch/src/widgets.js`.
- Do not manually edit `src/plugin.js` or `src/instantsearch.js` for normal widget additions; they already derive registration and exports from `widgets.js`.
- Search `packages/vue-instantsearch/src/__tests__/common-widgets.test.js` and `common-connectors.test.js` for placeholder "not supported" branches before deciding the widget is genuinely absent.

## Missing-feature caution

- Recommendation widgets, chat, and filter suggestions already have connector-level test placeholders in Vue, but several still throw explicit "not supported" errors at the widget layer.
- If you port one of those widgets, remove the placeholder failure and replace it with real setup code plus the component implementation.
