# E2E Testing Guide

## Test Locations and Frameworks

| Location | Framework | Purpose |
|----------|-----------|---------|
| `tests/e2e/playwright/` | Playwright | Main e2e suite for all InstantSearch flavors |
| `tests/e2e/` (wdio files) | WebdriverIO | IE11 tests only (via Sauce Labs) |
| `packages/react-instantsearch-nextjs/__tests__/e2e/` | Playwright | App Router Next.js e2e tests |
| `packages/react-instantsearch-router-nextjs/__tests__/e2e/` | Playwright | Pages Router Next.js e2e tests |

## Running Tests Locally

### Main E2E Suite (Playwright)

**Prerequisites:** Examples must be built first:
```bash
yarn website:examples
```

```bash
# Run all Playwright tests (all flavors, chromium + firefox)
yarn test:e2e

# Run tests for a specific flavor
E2E_FLAVOR=react yarn test:e2e

# Run tests for a specific browser (faster local dev)
E2E_BROWSER=chromium yarn test:e2e

# Combine both for fastest local iteration
E2E_FLAVOR=react E2E_BROWSER=chromium yarn test:e2e

# Run tests with UI mode for debugging
yarn workspace @instantsearch/e2e-tests test:playwright --ui
```

### Next.js Package Tests

```bash
# App Router (react-instantsearch-nextjs)
yarn workspace react-instantsearch-nextjs test:e2e

# Pages Router (react-instantsearch-router-nextjs)
yarn workspace react-instantsearch-router-nextjs test:e2e

# Run with list reporter (outputs to terminal instead of opening browser)
yarn workspace react-instantsearch-nextjs test:e2e --reporter=list
yarn workspace react-instantsearch-router-nextjs test:e2e --reporter=list
```

### IE11 Tests (Requires Sauce Labs credentials)

```bash
# Set environment variables first
export SAUCE_USERNAME=your_username
export SAUCE_ACCESS_KEY=your_access_key

yarn test:e2e:ie11
```

## Writing Playwright Tests

### Test Structure

```typescript
import { test, expect } from '../fixtures';

test.describe('feature name', () => {
  test('does something specific', async ({ page, helpers }) => {
    // Use '.' to navigate to baseURL, NOT '/' (which goes to root)
    await page.goto('.');

    // Use helpers for common InstantSearch interactions
    await helpers.clickRefinementListItem('Apple');
    await helpers.setSearchBoxValue('macbook');

    // Use Playwright's built-in assertions
    await expect(page.locator('.ais-Hits-item')).toHaveCount(16);
  });
});
```

### Available Helper Methods

The `helpers` fixture provides these methods:

**RefinementList:**
- `clickRefinementListItem(label)` - Click a refinement list item
- `getSelectedRefinementListItem()` - Get the selected item's text

**SearchBox:**
- `setSearchBoxValue(value)` - Set the search input value
- `getSearchBoxValue()` - Get the current search value

**Hits:**
- `getHitsTitles()` - Get all hit titles as an array

**HierarchicalMenu:**
- `clickHierarchicalMenuItem(label)` - Click a menu item
- `getSelectedHierarchicalMenuItems()` - Get selected items

**RangeSlider:**
- `dragRangeSliderLowerBoundTo(value)` - Drag lower handle
- `dragRangeSliderUpperBoundTo(value)` - Drag upper handle
- `getRangeSliderLowerBoundValue()` - Get lower bound value
- `getRangeSliderUpperBoundValue()` - Get upper bound value

**Pagination:**
- `clickPage(n)` - Navigate to page n
- `clickNextPage()` - Go to next page
- `clickPreviousPage()` - Go to previous page
- `getCurrentPage()` - Get current page number

**ToggleRefinement:**
- `clickToggleRefinement()` - Toggle the refinement
- `getToggleRefinementStatus()` - Get checked status

**RatingMenu:**
- `clickRatingMenuItem(label)` - Click rating (e.g., "4 & up")
- `getSelectedRatingMenuItem()` - Get selected rating label

**SortBy:**
- `setSortByValue(label)` - Select sort option by label
- `getSortByValue()` - Get current sort value

**HitsPerPage:**
- `setHitsPerPage(label)` - Select hits per page
- `getHitsPerPage()` - Get current value

**ClearRefinements:**
- `clickClearRefinements()` - Click clear button

### Best Practices

1. **Use helpers for InstantSearch interactions** - They handle waiting for URL changes automatically
2. **Prefer Playwright's auto-waiting assertions** - Use `await expect(locator).toHaveText('...')` instead of manual waits
3. **Avoid `page.waitForTimeout()`** - Use proper waits like `waitForURL()` or `expect.poll()`
4. **Use locator chaining** - `page.locator('.parent').locator('.child')`
5. **Use `'.'` for baseURL navigation** - `page.goto('.')` navigates to the baseURL path; `page.goto('/')` goes to the root domain (common mistake)
6. **Prefer relative paths** - For routes like `search/category/?query=test`, use paths without leading `/`
7. **Avoid hardcoded test data** - The Algolia index data can change. Instead of checking exact product names, verify behavior (e.g., results changed, count > 0, URL updated)
8. **Wait for results after navigation** - After pagination or filter changes, wait for new results to load before asserting
9. **Don't use `scrollIntoViewIfNeeded()`** - Playwright auto-scrolls elements into view before clicking
10. **Don't add redundant waits after URL waits** - If you wait for URL change, the UI has already updated; no need to also wait for element visibility

## Flavor System

The main e2e suite tests multiple InstantSearch flavors:

- `js` - instantsearch.js with vanilla JS
- `js-umd` - instantsearch.js UMD build
- `react` - React InstantSearch
- `vue` - Vue InstantSearch

Tests run against example apps in `website/examples/{flavor}/e-commerce/`.

To run a single flavor:
```bash
E2E_FLAVOR=react yarn test:e2e
```

## IE11 Considerations

IE11 tests are kept in WebdriverIO because Playwright doesn't support IE11. These tests:
- Only run `js` and `js-umd` flavors
- Require Sauce Labs for remote IE11 browser
- Use the same test specs in `tests/e2e/specs/` and helpers in `tests/e2e/helpers/`

## Debugging

### Playwright

```bash
# Run with headed browser
yarn workspace @instantsearch/e2e-tests test:playwright --headed

# Run with UI mode (interactive debugging)
yarn workspace @instantsearch/e2e-tests test:playwright --ui

# Run specific test file
yarn workspace @instantsearch/e2e-tests test:playwright specs/brand-and-query.spec.ts

# Debug mode with inspector
PWDEBUG=1 yarn workspace @instantsearch/e2e-tests test:playwright
```

### View Test Reports

After running tests, open the HTML report:
```bash
npx playwright show-report tests/e2e/playwright/playwright-report
```

## Troubleshooting

### Tests timeout waiting for elements

1. **Check if examples are built**: Run `yarn website:examples` before running tests
2. **Check if the server starts**: The webServer uses port 3456 (not 5000, which conflicts with macOS AirPlay)
3. **Check navigation**: Use `page.goto('.')` not `page.goto('/')` to navigate to baseURL

### Port conflicts on macOS

On macOS, port 5000 is used by AirPlay Receiver (ControlCenter). The tests use port 3456 instead. If you need to change the port, update:
- `tests/e2e/playwright/playwright.config.ts` (both `baseURL` and `webServer.command/url`)

### SPA routing not working

The e-commerce examples use History API routing (e.g., `/search/Appliances/`). The `website/serve.json` file configures rewrites for these routes. If you add new SPA routes, update this file:
```json
{
  "rewrites": [
    { "source": "/examples/js/e-commerce/search/**", "destination": "/examples/js/e-commerce/index.html" }
  ]
}
```

### Tests are flaky with multiple workers

The static server can handle 2 parallel workers. All configs use 2 workers for both CI and local runs.

Tests have 1 retry locally and 2 retries in CI to handle occasional flakiness.

### Multiple elements matched

If you see "strict mode violation" errors about multiple elements:
- SearchBox selectors are scoped to the header to avoid matching RefinementList search inputs
- Use more specific selectors when targeting widgets that may appear multiple times

### Different HTML structures across flavors

The JS and React examples have different HTML structures:
- **JS examples**: Use `id="header"` and `data-widget="searchbox"` attributes
- **React examples**: Use `className="header"` (class instead of id) and render SearchBox directly inside header

The fixtures account for this with combined selectors like:
```typescript
'#header .ais-SearchBox [type=search], .header > .ais-SearchBox [type=search], [data-widget="searchbox"] .ais-SearchBox [type=search]'
```

If you add new selectors, ensure they work across all flavors.

## Migration Notes: WebDriverIO to Playwright

When migrating tests from WebDriverIO to Playwright, be aware of these differences:

### URL Waiting

- **WebDriverIO**: Used custom `waitForUrl()` that polls `browser.getUrl()` until match
- **Playwright**: Use `await expect(page).toHaveURL(url)` which has built-in retrying

### Element Selection

- **WebDriverIO**: `$('.ais-Hits-item')` returns first match, clicking works on container elements
- **Playwright**: `page.locator('.ais-Hits-item').first()` - clicking on container may not hit child link elements. Use `.locator('a')` to target links explicitly:
  ```typescript
  // WebDriverIO
  const link = await $('.ais-Hits-item');
  await link.click();

  // Playwright - click the link inside the hit
  const link = page.locator('.ais-Hits-item a').first();
  await link.click();
  ```

### Browser Back Navigation

- **WebDriverIO**: `browser.back()` worked reliably for SPA navigation
- **Playwright**: `page.goBack()` works but may require `slowMo` in headless mode for Next.js App Router dynamic routes

### Headless Mode Timing Issues

Playwright's headless mode runs faster than headed mode, which can cause timing issues with SPA navigation and state updates. For Next.js App Router tests involving browser back/forward navigation with dynamic routes, add `slowMo` at the test file level (not globally, to avoid slowing down all tests):

```typescript
import { test, expect } from '@playwright/test';

// slowMo is required for browser back/forward navigation tests in headless mode
test.use({ launchOptions: { slowMo: 500 } });

test.describe('browser back/forward buttons', () => {
  // tests that use page.goBack() or page.goForward()
});
```

This gives the browser enough time to process JavaScript events like popstate handlers used by InstantSearch routing, while keeping other tests fast.

## CI Integration

Tests run in CircleCI:
- **e2e tests playwright** - Main suite with Chromium + Firefox
- **e2e tests ie11** - IE11 via Sauce Labs
- **e2e tests router nextjs** - Pages Router Next.js tests
- **e2e tests app router nextjs** - App Router Next.js tests

JUnit reports are stored for test results visualization.
Playwright HTML reports are stored as artifacts.
