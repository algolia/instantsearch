Vendored copy of [`markdown-to-jsx`](https://github.com/quantizor/markdown-to-jsx) v7.7.15 (MIT, see `LICENSE`), taken from the original TypeScript embedded in the npm package's source map.

Changes from upstream:

- React types are replaced by the shared `Renderer` types, so the module has no `react` import, not even as a type.
- `createElement` must be passed in options (no `React.createElement` fallback).
- The `<Markdown>` React component and the default export are removed.
- Raw HTML parsing is removed: the `htmlBlock` and `htmlSelfClosing` rules, the `disableParsingRawHTML` option and the state, types and helpers that only they used. HTML comments are still dropped.
- Formatted and linted with the repo's config, and type-checked under its strict TypeScript config: non-null assertions, `any` casts for dynamic indexing, `null` added to a few declared types, unused parameters prefixed with `_`, `var` replaced by `let`/`const`, a sparse array literal written with an explicit `undefined`, `LOOKAHEAD` renamed to `lookahead`, type parameters renamed to the `T` prefix convention, and `eslint-disable` comments for the dev-only `console.warn` calls, the namespace and a deprecated type. The emitted JavaScript is otherwise unchanged.
