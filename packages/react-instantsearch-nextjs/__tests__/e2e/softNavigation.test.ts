import { test, expect } from '@playwright/test';

// Reproduces https://github.com/algolia/instantsearch/issues/7060:
// on a client-side (soft) navigation that lands on the first InstantSearch page
// of the session (here, coming from a page without InstantSearch), the
// server-rendered results stopped being reflected and the page showed empty
// hits until a full reload. The `/landing` page has no InstantSearch, so this
// exercises exactly that case. Verified to fail before the fix (0 hits).
test.describe('client-side navigation refreshes results', () => {
  test('renders results when navigating from a page without InstantSearch', async ({
    page,
  }) => {
    await page.goto('/landing');

    await page.locator('#to-appliances').click();
    await expect(page).toHaveURL('http://localhost:3000/Appliances');

    await expect(page.locator('.ais-Hits-item').first()).toBeVisible();
    await expect(page.locator('.ais-Hits-item')).not.toHaveCount(0);
  });
});
