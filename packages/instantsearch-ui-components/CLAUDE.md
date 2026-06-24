# instantsearch-ui-components

The **framework-agnostic UI layer** — the shared markup/layout for widgets, reused by every flavor. This is where a widget's DOM structure and `ais-*` CSS classes live for **newer** widgets. (Older widgets still define their layout per-flavor; see "Old vs new" below.)

## The factory + renderer pattern

Components are **not** React/Preact/Vue components directly. Each is a factory that takes a renderer and returns a component:

```tsx
/** @jsx createElement */
import { cx } from '../lib';
import type { Renderer, ComponentProps } from '../types';

export function createHitsComponent({ createElement, Fragment }: Renderer) {
  return function Hits(props) {
    return <div className={cx('ais-Hits', props.classNames.root)}>…</div>;
  };
}
```

- **`Renderer` = `{ createElement, Fragment }`** is *injected* by the consumer (`src/types/Renderer.ts`). Defaults are Preact's, but React passes `react`'s `createElement` and Vue passes its own `h` (wired up via the `renderCompat` helper in `vue-instantsearch`). **Never import `preact`/`react`/`vue` directly** — go through the injected renderer. The `/** @jsx createElement */` pragma at the top of each file is what wires JSX to the injected function.
- Class names go through **`cx`** (`src/lib/cx.ts`) and follow the `ais-<Widget>-<element>` contract that `instantsearch.css` themes — treat those class names as a public API.
- Props are typed with `ComponentProps<'div'>`-style helpers from `src/types`; expose a `classNames` partial so consumers can extend styling.

## Layout

- `src/components/<Name>.tsx` — a `create<Name>Component` factory. Exported from `src/components/index.ts` → `src/index.ts`.
- Grouped families: `src/components/autocomplete/`, `src/components/chat/`, `src/components/recommend-shared/` (+ the recommend widgets `RelatedProducts`, `FrequentlyBoughtTogether`, `LookingSimilar`, `TrendingItems`, `TrendingFacets`).
- `src/lib/` — `cx`, `stickToBottom`, shared `utils`. `src/types/` — `Renderer`, `ComponentProps`, `Hooks`, `Recommend`, `shared`.
- Runtime deps are minimal on purpose (`markdown-to-jsx`, `@swc/helpers`); **no framework as a dependency**.

## Old vs new (important)

- **New widgets:** layout lives here and is consumed by all flavors — React via `import { create<Name>Component } from 'instantsearch-ui-components'`, Vue via the `renderCompat` helper, JS via the Preact renderer.
- **Older widgets:** layout was defined per-flavor — JS in `packages/instantsearch.js/src/components/` (Preact), React in `packages/react-instantsearch/src/ui/`. The migration direction is to consolidate that markup here; some JS-package components are now thin wrappers that import from this package.
- When adding/changing **shared** layout, do it here. When touching a widget that still defines its own markup, check whether it should be migrated rather than forked.

## Working here

```bash
yarn workspace instantsearch-ui-components build       # tsc/rollup + build:types
yarn jest packages/instantsearch-ui-components/src/components/__tests__/<Name>   # from repo root
```

- Tests are co-located in `src/components/__tests__/`. Test the component by passing a concrete renderer (e.g. Preact's) — assert rendered structure and class names, not implementation.
- A markup or class-name change here **ripples to React, Vue, and JS at once** — verify consumers and keep the `ais-*` contract stable (a class rename is a breaking change that also touches `instantsearch.css`).
