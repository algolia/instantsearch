Vendored copy of [`markdown-to-jsx`](https://github.com/quantizor/markdown-to-jsx) v7.7.15 (MIT, see `LICENSE`), taken from the original TypeScript embedded in the npm package's source map.

Changes from upstream:

- React types are replaced by the shared `Renderer` types, so the module has no `react` import, not even as a type.
- `createElement` must be passed in options (no `React.createElement` fallback).
- The `<Markdown>` React component and the default export are removed.
- Formatted and linted with the repo's config, and type-checked under its strict TypeScript config: non-null assertions, `any` casts for dynamic indexing, `null` added to a few declared types, unused parameters prefixed with `_`, `var` replaced by `let`/`const`, a sparse array literal written with an explicit `undefined`, `LOOKAHEAD` renamed to `lookahead`, type parameters renamed to the `T` prefix convention, and `eslint-disable` comments for the dev-only `console.warn` calls, the namespace and a deprecated type. The emitted JavaScript is otherwise unchanged.
- Three regexes no longer backtrack catastrophically on adversarial input (each took seconds for a few kilobytes). The inline code regex requires the opening run of backticks to be the whole run, so an opener of three backticks closed by two now renders a literal backtick followed by a code span `x`, instead of a code span containing `` `x ``. The HTML block and self-closing element matchers return early when the source has no closing tag or no `>`, which those regexes need anyway, so their results are unchanged.
