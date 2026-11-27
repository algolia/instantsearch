# instantsearch-ui-components

The **framework-agnostic UI layer** — the shared markup/layout for widgets, reused by every flavor. This is where a widget's DOM structure and `ais-*` CSS classes live. Not every widget takes its markup from here — see "Who gets markup from here".

## The factory + renderer pattern

Components are **not** React/Preact/Vue components directly. Each is a factory that takes a renderer and returns a component:

```tsx
/** @jsx createElement */
import { cx } from '../lib';

import type { ComponentProps, Renderer } from '../types';

export type ClearRefinementsClassNames = {
  root: string | string[];
  button: string | string[];
  disabledButton: string | string[];
};

export type ClearRefinementsProps = ComponentProps<'div'> & {
  classNames?: Partial<ClearRefinementsClassNames>;
  canRefine?: boolean;
  onClick?: () => void;
};

// Abbreviated src/components/ClearRefinements.tsx — keep the shape below.
export function createClearRefinementsComponent({ createElement }: Renderer) {
  return function ClearRefinements(userProps: ClearRefinementsProps) {
    const { classNames = {}, canRefine = false, onClick, ...props } = userProps;

    return (
      <div
        {...props}
        className={cx('ais-ClearRefinements', classNames.root, props.className)}
      >
        <button
          type="button"
          disabled={!canRefine}
          onClick={onClick}
          className={cx(
            'ais-ClearRefinements-button',
            classNames.button,
            !canRefine &&
              cx(
                'ais-ClearRefinements-button--disabled',
                classNames.disabledButton
              )
          )}
        >
          Clear refinements
        </button>
      </div>
    );
  };
}
```

- **`Renderer` = `{ createElement, Fragment }`** is _injected_ by the consumer (`src/types/Renderer.ts`). Defaults are Preact's, but React passes `react`'s `createElement` and Vue passes its own `h` (wired up via the `renderCompat` helper in `vue-instantsearch`). **Never import `preact`/`react`/`vue` directly** — go through the injected renderer. The `/** @jsx createElement */` pragma at the top of each file is what wires JSX to the injected function.
- Class names go through **`cx`** (`src/lib/cx.ts`) and follow the `ais-<Widget>-<element>` contract that `instantsearch.css` themes — treat those class names as a public API.
- Props are typed with `ComponentProps<'div'>`-style helpers from `src/types`; expose a `classNames` partial so consumers can extend styling.
- **`__tests__/types.test.ts`** (package root, _not_ under `src/`) **checks this contract on the built declarations** in `dist/es/components`: a factory must be named `create<Name>Component` and return a function taking `userProps`. Hanging a host-callable helper off the component (`Object.assign(Component, { restore })`, so a flavor's teardown can call it) is allowed — the emitted intersection still passes — but a factory returning anything that isn't a function doesn't.

## Layout

- `src/components/<Name>.tsx` — a `create<Name>Component` factory. Exported from `src/components/index.ts` → `src/index.ts`.
- Grouped families: `src/components/autocomplete/`, `src/components/chat/`, `src/components/recommend-shared/` (+ the recommend widgets `RelatedProducts`, `FrequentlyBoughtTogether`, `LookingSimilar`, `TrendingItems`, `TrendingFacets`).
- `src/lib/` — `cx`, `stickToBottom`, shared `utils`. `src/types/` — `Renderer`, `ComponentProps`, `Hooks`, `Recommend`, `shared`.
- Runtime deps are minimal on purpose (`@swc/helpers`); **no framework as a dependency**. Markdown rendering uses a vendored copy of `markdown-to-jsx` in `src/lib/markdown-to-jsx/` (with no React in it — see its README); it is linted, formatted and type-checked like the rest.

## Who gets markup from here

- **Widgets built on this package:** their layout lives here and all three flavors consume it — React via `import { create<Name>Component } from 'instantsearch-ui-components'`, Vue via the `renderCompat` helper, JS via the Preact renderer.
- **Widgets with per-flavor markup:** JS in `packages/instantsearch.js/src/components/` (Preact), React in `packages/react-instantsearch/src/ui/`. Some JS components there are thin wrappers that import from this package.
- Write **shared** layout here. A widget that defines its own markup keeps it in its flavor — one home per widget, so don't copy markup into this package and leave the flavor's copy in place.

## Working here

```bash
yarn lerna run build --scope instantsearch-ui-components   # tsc/rollup + build:types
yarn jest packages/instantsearch-ui-components/src/components/__tests__/<Name>   # from repo root
```

- Tests are co-located in `src/components/__tests__/`. Test the component by passing a concrete renderer (e.g. Preact's) — assert rendered structure and class names, not implementation.
- A markup or class-name change here **ripples to React, Vue, and JS at once** — verify consumers and keep the `ais-*` contract stable (a class rename is a breaking change that also touches `instantsearch.css`).
