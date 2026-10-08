Vendored copy of [`markdown-to-jsx`](https://github.com/quantizor/markdown-to-jsx) v7.7.15 (MIT, see `LICENSE`),
taken from the original TypeScript embedded in the npm package's source map.

Changes from upstream:

- React types are replaced by the shared `Renderer` types, so the module has no `react` import, not even as a type.
- `createElement` must be passed in options (no `React.createElement` fallback).
- The `<Markdown>` React component and the default export are removed.
