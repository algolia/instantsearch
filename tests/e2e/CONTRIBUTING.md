# Contributing

This package contains the [Playwright](https://playwright.dev) end-to-end (e2e) test suite for
InstantSearch. It is shared across all InstantSearch flavors — which is why it lives in the
monorepo — and runs against the **e-commerce** example built for each flavor (`js`, `js-umd`,
`react`, `vue`).

## Development

### Running the tests

Build the examples the tests run against, then run the suite:

```sh
yarn website:examples
yarn test:e2e
```

Filter on a single flavor and/or browser by setting the `E2E_FLAVOR` / `E2E_BROWSER` environment
variables (fastest local loop):

```sh
E2E_FLAVOR=react E2E_BROWSER=chromium yarn test:e2e
# E2E_FLAVOR: js, js-umd, react, vue — E2E_BROWSER: chromium, firefox
```

### Writing tests

Tests and helpers live in the [`playwright/`](playwright) directory. Each spec covers a single
feature from a user's point of view (e.g. pagination) and uses the shared `helpers` fixture for
common InstantSearch interactions, for readability and maintainability.

Some general guidelines:

- Prefer Playwright's auto-waiting assertions (`await expect(locator).toHaveText(...)`) over manual waits.
- Use the `helpers` fixture whenever possible — if a widget changes, only its helper needs updating.
- Only assert what should be visible after an action (Is the checkbox selected? Is the result list correct?).
- Avoid hardcoded index data; assert on behavior (results changed, count > 0, URL updated) rather than exact product names.

The full guide — available helpers, best practices, debugging, and CI integration — is in
[`.claude/rules/e2e.md`](../../.claude/rules/e2e.md).
