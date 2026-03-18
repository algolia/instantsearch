# Testing and Examples

## Start with the common suites

### Wrapper or public widget change

- Update `tests/common/widgets/<widget>/`.
- Register or unskip the suite in each flavor's `common-widgets.test.*`:
  - `packages/instantsearch.js/src/__tests__/common-widgets.test.tsx`
  - `packages/react-instantsearch/src/__tests__/common-widgets.test.tsx`
  - `packages/vue-instantsearch/src/__tests__/common-widgets.test.js`
- For previously unsupported widgets: replace the `throw new Error('X is not supported in ...')` placeholder with real setup code, and remove the `skippedTests` entry in `testOptions`.

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

## Vue-specific test timing

### State delivery is async for some connectors

Most connectors (e.g. `connectRefinementList`) deliver state synchronously during `mountApp` because the mock search client responds immediately. Newer connectors like `connectChat` deliver state asynchronously. The Vue test setup must account for this:

```javascript
mountApp({ render: ... }, container);
await nextTick();                                      // Vue tick
await new Promise((resolve) => setTimeout(resolve, 0)); // macrotask for async state
await nextTick();                                      // Vue tick to re-render
```

### Provide a custom `act` for Vue

Vue batches DOM updates asynchronously, unlike React which re-renders synchronously within event handlers. Tests that `await act(async () => { await wait(0); })` work because `act` wraps the wait. Provide a custom `act` in `testOptions` that flushes Vue's update queue:

```javascript
createXxxWidgetTests: {
  act: async (cb) => {
    await cb();
    await nextTick();
  },
},
```

Tests that click then immediately assert DOM changes (without `act`) will still fail in Vue. These are known limitations of the shared test suite's React-centric timing assumptions. Document them in the `testOptions` but avoid skipping the entire test suite.

### Flavored test params

For `flavored` test suites (like Chat), `runTestSuites` extracts the flavor-specific params via `widgetParams[flavor]`. The Vue setup function receives only the Vue portion. Ensure the Vue params include all required connector params (e.g. `agentId`, `chat`) — empty `{}` will cause connector errors.

When Vue params need component functions (tools with `layoutComponent`, custom `headerComponent`), use `import { h as vueH } from 'vue'` in the `.tsx` test file and return VNodes: `() => vueH('div', { class: 'foo' }, 'text')`.

### skippedTests granularity

`skippableDescribe` only skips entire describe blocks by name. Individual test names in `skippedTests` have no effect unless the test file uses `skippableTest`. The shared chat/options/templates/translations test files use plain `test()`, so individual test skipping is not available for Chat widget tests.

## Useful commands

```bash
# Common widget/connector tests
npx jest packages/instantsearch.js/src/__tests__/common-widgets.test.tsx --no-coverage
npx jest packages/instantsearch.js/src/__tests__/common-connectors.test.tsx --no-coverage
npx jest packages/react-instantsearch/src/__tests__/common-widgets.test.tsx --no-coverage
npx jest packages/react-instantsearch/src/__tests__/common-connectors.test.tsx --no-coverage
npx jest packages/vue-instantsearch/src/__tests__/common-widgets.test.js --no-coverage

# Run only tests matching a specific widget name
npx jest packages/react-instantsearch/src/__tests__/common-widgets.test.tsx --testNamePattern="MenuSelect" --no-coverage

# Flavor-specific tests
npx jest packages/react-instantsearch/src/widgets/__tests__ --no-coverage
npx jest packages/instantsearch.js/src/widgets/<widget> --no-coverage

# Update snapshots after adding new exports
npx jest packages/react-instantsearch/src/widgets/__tests__ --no-coverage -u

# E2E
yarn website:examples
E2E_FLAVOR=react E2E_BROWSER=chromium yarn test:e2e
```
