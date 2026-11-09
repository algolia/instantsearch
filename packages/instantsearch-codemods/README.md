<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Codemods](#codemods)
  - [`rish-to-ris`](#rish-to-ris)
  - [`ris-v6-to-v7`](#ris-v6-to-v7)
  - [`is-v4-to-v5`](#is-v4-to-v5)
  - [`addWidget-to-addWidgets`](#addwidget-to-addwidgets)
  - [Notes](#notes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Codemods

These codemods (code transformers) can be ran with [jscodeshift](https://github.com/facebook/jscodeshift).

### `rish-to-ris`

This will replace all imports from `react-instantsearch-hooks` to their `react-instantsearch` equivalent.

```
npx @codeshift/cli --packages 'instantsearch-codemods#rish-to-ris' <path>
```

### `ris-v6-to-v7`

This will:

- Replace `react-instantsearch-dom` imports to `react-instantsearch`
- Replace prop names to their new equivalent
- Replace `translations` keys to their new equivalent if they are defined inline, otherwise it will add a TODO comment
- Add some TODO comments to help you migrate

```
npx @codeshift/cli --packages 'instantsearch-codemods#ris-v6-to-v7' <path>
```

### `is-v4-to-v5`

Migrates InstantSearch.js, React InstantSearch and Vue InstantSearch code from v4 to v5. It transforms JavaScript and TypeScript files (`.js`, `.jsx`, `.ts`, `.tsx`), not `.vue` files. It will:

- Rename removed `EXPERIMENTAL_*` APIs (`EXPERIMENTAL_autocomplete`, `EXPERIMENTAL_dynamicWidgets`, `EXPERIMENTAL_use`, `EXPERIMENTAL_isolated`) and other renamed APIs (`getWidgetState`, `hasMapMoveSinceLastRefine`, `hasRefinements`, deprecated helper methods like `addRefine`)
- Replace `addWidget`/`removeWidget` with `addWidgets`/`removeWidgets`
- Replace `hasNoResults` with `!canRefine` and `hits` with `items` for `useHits`/`useInfiniteHits`
- Replace `instantsearch.highlight`, `snippet`, `reverseHighlight`, `reverseSnippet` (and friends) with imports
- Rename `getLocation` to `getCurrentURL` and `location` to `currentURL` in custom routers
- Pass `cleanUrlOnDispose: true` to history routers, to keep the v4 behavior, with a TODO comment to adopt the new default
- Add TODO comments where a manual change is needed (`searchFunction`, `isSearchStalled`, `escapeHTML`, range `start`, removed widgets, `routing: true`)

`.vue` files are not transformed, so Vue templates and script blocks (for example the `has-no-results` slot prop and `search-function` prop) need manual changes.

```
npx @codeshift/cli --packages 'instantsearch-codemods#is-v4-to-v5' <path>
```

### `addWidget-to-addWidgets`

This will replace all `addWidget` calls to `addWidgets` and `removeWidget` calls to `removeWidgets`.

```
npx @codeshift/cli --packages 'instantsearch-codemods#addWidget-to-addWidgets' <path>
```

### Notes

If you are using a formatter or a linter, make sure to run its autofixing after this transformation, since code can be formatted differently after it has been transformed. In our repository, that would be:

```
yarn format
```
