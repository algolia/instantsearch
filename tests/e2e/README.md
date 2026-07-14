# End-to-end test suite for InstantSearch

This package contains the [Playwright](https://playwright.dev) end-to-end test suite for all
InstantSearch flavors (`js`, `js-umd`, `react`, `vue`). Tests run against the **e-commerce**
example built for every flavor.

## Installation

The workspace automatically links the dependencies when you run `yarn` at the root of the monorepo.

## Running the test suite

The examples must be built first, then run the suite:

```bash
yarn website:examples
yarn test:e2e
```

Scope to a single flavor and/or browser for faster local iteration:

```bash
E2E_FLAVOR=react E2E_BROWSER=chromium yarn test:e2e
```

The suite starts a static server on port `3456` to serve the `website` directory, which contains
the InstantSearch demos the tests run against.

See the full guide — available helpers, debugging, and CI integration — in
[`.claude/rules/e2e.md`](../../.claude/rules/e2e.md).
