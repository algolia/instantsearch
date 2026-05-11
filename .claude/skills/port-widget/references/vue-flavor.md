# Vue Flavor (`vue-instantsearch`)

## Current patterns in this repo

- Slot-heavy SFCs: `RefinementList.vue`, `Menu.vue`, `Pagination.vue`
- Render-function wrappers around shared UI components: `Hits.js`, `Highlighter.js`, `DynamicWidgets.js`, `Feeds.js`
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
- Use `createSuitMixin({ name: '<Pascal>' })` for BEM classes. When the widget
  delegates all rendering to a shared `createXxxComponent` factory, the suit
  mixin's `suit()` method goes unused but the `classNames` prop it provides is
  still convenient. Pass `this.classNames` directly to the shared component's
  `classNames` prop (semantic keys like `{ root, container }`, not BEM keys).
- Expose connector params through a computed `widgetParams()` object.
- When reusing shared UI factories, wrap the render function with
  `renderCompat(...)` and map `this.classNames` into the `classNames` prop
  expected by the shared component.
- Prefer `getScopedSlot` or `getDefaultSlot` helpers over direct slot access
  when matching render-function components.
- In render-function callbacks that reference connector state (e.g. `onSubmit`,
  `onInput`), read from `this.state.xxx` instead of destructured locals. Vue
  batches re-renders, so destructured values become stale between synchronous
  user interactions (type then click).

## Annotated template — render function around a shared UI factory

This is the pattern to use for recommendation widgets (`RelatedProducts`,
`TrendingItems`, `TrendingFacets`, `FrequentlyBoughtTogether`, `LookingSimilar`)
and other widgets that reuse a `createXxxComponent` factory from
`instantsearch-ui-components`. Distilled from `Hits.js` and `Feeds.js`:

```js
import { createXxxComponent } from 'instantsearch-ui-components';
import { connectXxx } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { getScopedSlot, renderCompat } from '../util/vue-compat';

export default {
  name: 'AisXxx',
  mixins: [
    createWidgetMixin(
      { connector: connectXxx },
      { $$widgetType: 'ais.xxx' }, // keep aligned with JS and React
    ),
    createSuitMixin({ name: 'Xxx' }),
  ],
  props: {
    // 1:1 with connector params — keep names matching the React widget's props.
    limit: { type: Number, default: undefined },
    transformItems: { type: Function, default: undefined },
    // ...
  },
  computed: {
    widgetParams() {
      return {
        limit: this.limit,
        transformItems: this.transformItems,
        // ...
      };
    },
  },
  render: renderCompat(function (h) {
    if (!this.state) {
      return null; // connector hasn't delivered state yet
    }

    // Map Vue scoped slots onto the shared UI factory's component props.
    const itemSlot = getScopedSlot(this, 'item');
    const headerSlot = getScopedSlot(this, 'header');

    return h(createXxxComponent({ createElement: h }), {
      items: this.state.items,
      sendEvent: this.state.sendEvent,
      itemComponent: itemSlot,
      headerComponent: headerSlot,
      classNames: this.classNames && {
        root: this.classNames['ais-Xxx'],
        list: this.classNames['ais-Xxx-list'],
        item: this.classNames['ais-Xxx-item'],
        // ...
      },
    });
  }),
};
```

When the matching React widget uses `useInstantSearch().status` (most
recommendation widgets do), expose it through Vue's `state` too — the connector
already does this for you via `createWidgetMixin`.

## Registration checklist

- Export the component from `packages/vue-instantsearch/src/widgets.js`.
- Do not manually edit `src/plugin.js` or `src/instantsearch.js` for normal
  widget additions; they already derive registration and exports from
  `widgets.js`.
- Search `packages/vue-instantsearch/src/__tests__/common-widgets.test.js` and
  `common-connectors.test.js` for placeholder "not supported" branches before
  deciding the widget is genuinely absent. The audit script
  (`--gaps` mode) lists which widgets still have placeholders.

## Missing-feature caution

- Recommendation widgets, chat, and filter suggestions already have
  connector-level test placeholders in Vue, but most still throw explicit
  "not supported" errors at the widget layer.
- The placeholder name does not always match `PascalCase(widget)` — for
  example `related-products` uses `RelatedProduct` (singular). The audit
  prints the exact string.
- When porting one of those widgets, remove the placeholder failure and
  replace it with real setup code plus the component implementation.
- For async connectors like `connectChat`, follow the Vue test timing notes
  in [testing.md](./testing.md) — initial state arrives after a macrotask,
  so the test setup needs both `nextTick()` and a `setTimeout(0)` wait.
