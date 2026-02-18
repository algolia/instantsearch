import { test, expect } from '@playwright/test';

// slowMo is required for browser back/forward navigation tests in headless mode
// The Next.js App Router dynamic routes need extra time to process popstate events
test.use({ launchOptions: { slowMo: 500 } });

test.describe('browser back/forward buttons', () => {
  test('works on a single page with InstantSearch', async ({ page }) => {
    await page.goto('/');

    const appleRefinementListItem = page.locator(
      '.ais-RefinementList-checkbox[value="Apple"]'
    );
    await appleRefinementListItem.click();

    const urlWithRefinement =
      'http://localhost:3000/?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple';
    await expect(page).toHaveURL(urlWithRefinement);

    // Ensure push was done by Next.js router
    const historyState = await page.evaluate(() => window.history.state);
    expect(historyState.__NA).toBe(true);

    const link = page.locator('#link');
    await link.click();

    await expect(page).toHaveURL('http://localhost:3000/layout');

    await page.goBack();

    await expect(page).toHaveURL(urlWithRefinement);

    const checkbox = page.locator(
      '.ais-RefinementList-checkbox[value="Apple"]'
    );
    await expect(checkbox).toBeChecked();
  });

  test('works on a page wrapped with a layout containing InstantSearch', async ({
    page,
  }) => {
    await page.goto('/layout');

    const links = page.locator('a', { hasText: 'Go to search page' });

    // Ensure hydration works and does not double on a page without widgets
    await expect(links).toHaveCount(1);
    await links.first().click();

    await expect(page).toHaveURL('http://localhost:3000/layout/search');

    const queryId = await page.locator('#query-id').textContent();

    await page.goBack();

    await expect(page).toHaveURL('http://localhost:3000/layout');

    await page.goForward();

    await expect(page).toHaveURL('http://localhost:3000/layout/search');

    const queryIdAfterForward = await page.locator('#query-id').textContent();

    const hits = page.locator('.ais-Hits-item');
    await expect(hits).not.toHaveCount(0);
    expect(queryIdAfterForward).toBe(queryId);
  });

  test('works on a dynamic route with links', async ({ page }) => {
    await page.goto('/Appliances');

    let firstHit = page.locator('.ais-Hits-item').first();
    await expect(firstHit).toContainText('Nest - Learning Thermostat');

    const audioLink = page.locator('a', { hasText: 'Audio' });
    await audioLink.click();
    await expect(page).toHaveURL('http://localhost:3000/Audio');

    // wait for results to load
    await expect(page.locator('.ais-Hits-item').first()).toContainText(
      'Apple - EarPods'
    );

    await page.goBack();
    await expect(page).toHaveURL('http://localhost:3000/Appliances');

    firstHit = page.locator('.ais-Hits-item').first();
    await expect(firstHit).toContainText('Nest - Learning Thermostat');
  });

  test('works on different pages with InstantSearch', async ({ page }) => {
    await page.goto('/Appliances');

    let firstHit = page.locator('.ais-Hits-item').first();
    await expect(firstHit).toContainText('Nest - Learning Thermostat');

    const homeLink = page.locator('a', { hasText: 'Home' });
    await homeLink.click();
    await expect(page).toHaveURL('http://localhost:3000/');

    // wait for results to load
    await expect(page.locator('.ais-Hits-item').first()).toContainText(
      'Amazon'
    );

    await page.goBack();
    await expect(page).toHaveURL('http://localhost:3000/Appliances');

    firstHit = page.locator('.ais-Hits-item').first();
    await expect(firstHit).toContainText('Nest - Learning Thermostat');
  });
});
