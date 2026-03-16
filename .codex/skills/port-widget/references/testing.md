# Testing and Examples

## Start with the common suites

### Wrapper or public widget change

- Update `tests/common/widgets/<widget>/`.
- Register or unskip the suite in:
  - `packages/instantsearch.js/src/__tests__/common-widgets.test.tsx`
  - `packages/react-instantsearch/src/__tests__/common-widgets.test.tsx`
  - `packages/vue-instantsearch/src/__tests__/common-widgets.test.js`

### Connector or hook API change

- Update `tests/common/connectors/<widget>/`.
- Register or unskip the suite in:
  - `packages/instantsearch.js/src/__tests__/common-connectors.test.tsx`
  - `packages/react-instantsearch/src/__tests__/common-connectors.test.tsx`
  - `packages/vue-instantsearch/src/__tests__/common-connectors.test.js`

## Flavor-specific tests

- JavaScript: `packages/instantsearch.js/src/widgets/<widget>/__tests__/`
- React: `packages/react-instantsearch/src/widgets/__tests__/`
- Vue: colocated component or package tests under `packages/vue-instantsearch/src/__tests__/`

Add flavor-specific tests only for behavior that the shared suites do not cover, such as:

- slot rendering differences in Vue
- React-only UI plumbing
- template or CSS-class edge cases in `instantsearch.js`
- registry coverage such as React's `all-widgets` helpers

## Shared cross-widget suites

- Search `tests/common/shared/` and `tests/common/shared-composition/` when the port affects routing, searchable behavior, or cross-widget composition.
- Only touch those suites when the new widget changes shared behavior rather than a single widget contract.

## Examples

- Search existing examples before editing; not every user-facing widget belongs in the e-commerce demos.
- E-commerce apps live in:
  - `examples/js/e-commerce/src/`
  - `examples/react/e-commerce/`
  - `examples/vue/e-commerce/src/`
- Recommendation, chat, and query-suggestion features already appear in getting-started or query-suggestions examples for JS and React.

## Useful commands

```bash
yarn test packages/instantsearch.js/src/__tests__/common-widgets.test.tsx
yarn test packages/instantsearch.js/src/__tests__/common-connectors.test.tsx
yarn test packages/react-instantsearch/src/__tests__/common-widgets.test.tsx
yarn test packages/react-instantsearch/src/__tests__/common-connectors.test.tsx
yarn test packages/vue-instantsearch/src/__tests__/common-widgets.test.js
yarn test packages/vue-instantsearch/src/__tests__/common-connectors.test.js
yarn test packages/react-instantsearch/src/widgets/__tests__/<Pascal>.test.tsx
yarn test packages/instantsearch.js/src/widgets/<widget>
yarn website:examples
E2E_FLAVOR=react E2E_BROWSER=chromium yarn test:e2e
```
