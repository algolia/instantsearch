# JavaScript Flavor (`instantsearch.js`)

## Reach for these precedents first

- Shared UI via `instantsearch-ui-components`: `hits`, `related-products`, `trending-items`, `filter-suggestions`
- Older Preact widget with templates and CSS helpers: `refinement-list`, `menu`, `pagination`
- UMD-specific edge case: `chat` is intentionally stubbed in `src/widgets/index.umd.ts`

## File layout

```text
packages/instantsearch.js/src/widgets/<widget>/
  <widget>.tsx
  defaultTemplates.tsx        # only when the widget exposes templates
  __tests__/<widget>-test.tsx # optional flavor-specific tests
```

## Wrapper pattern

- Import the connector from `../../connectors/<widget>/connect<Pascal>`.
- Build a `createRenderer(...)` helper that closes over `containerNode`, classes, templates, and any normalized props.
- Use `getContainerNode(container)` and throw via `createDocumentationMessageGenerator` when `container` is missing.
- Mount with `render(<UiComponent ... />, containerNode)` and unmount with `render(null, containerNode)`.
- Return `$$widgetType: 'ais.<camelName>'`.

## UI choice

- Prefer `instantsearch-ui-components` when the React and JS widgets should share markup.
- Keep local JSX only when the JS widget still depends on legacy template plumbing or DOM structure that is not shared elsewhere.
- If templates are supported, follow `TemplateComponent` and `prepareTemplateProps` patterns from a close sibling widget rather than inventing a new API.

## Registration checklist

- Export the connector from both `packages/instantsearch.js/src/connectors/index.ts` and `index.umd.ts`.
- Export the widget from both `packages/instantsearch.js/src/widgets/index.ts` and `index.umd.ts`.
- If the feature is intentionally unavailable in UMD, match the existing stubbed-error pattern instead of exporting a broken implementation.
