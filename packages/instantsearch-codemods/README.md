<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Codemods](#codemods)
  - [`rish-to-ris`](#rish-to-ris)
  - [`ris-v6-to-v7`](#ris-v6-to-v7)
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

### `addWidget-to-addWidgets`

This will replace all `addWidget` calls to `addWidgets` and `removeWidget` calls to `removeWidgets`.

```
npx @codeshift/cli --packages 'instantsearch-codemods#addWidget-to-addWidgets' <path>
```

### Notes

If you are using Prettier or ESLint, make sure to run its autofixing after this transformation, since code can be formatted differently after it has been transformed. For example, in our repository, the Prettier command would be:

```
yarn prettier --write '{examples,stories,.storybook}/**/*.{js,jsx,ts,tsx}'
```
