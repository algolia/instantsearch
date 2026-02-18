import { test, expect } from '@playwright/test';

test.describe('browser back/forward buttons works on routes pushed by InstantSearch', () => {
  test('works when not on a i18n route', async ({ page }) => {
    await page.goto('/');

    const appleRefinementListItem = page.locator(
      '.ais-RefinementList-checkbox[value="Apple"]'
    );
    await appleRefinementListItem.click();

    const urlWithRefinement =
      'http://localhost:3000/?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple';
    await page.waitForURL(urlWithRefinement);

    // Ensure push was done by Next.js router
    const historyState = await page.evaluate(() => window.history.state);
    expect(historyState.__N).toBe(true);

    const link = page.locator('.ais-Hits-item a').first();
    await link.click();

    await expect(page).toHaveURL('http://localhost:3000/other-page');

    await page.goBack();

    await expect(page).toHaveURL(urlWithRefinement);

    const checkbox = page.locator(
      '.ais-RefinementList-checkbox[value="Apple"]'
    );
    await expect(checkbox).toBeChecked();
  });

  test('works when on a i18n route', async ({ page }) => {
    await page.goto('/fr');

    const appleRefinementListItem = page.locator(
      '.ais-RefinementList-checkbox[value="Apple"]'
    );
    await appleRefinementListItem.click();

    const urlWithRefinement =
      'http://localhost:3000/fr?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple';
    await page.waitForURL(urlWithRefinement);

    // Ensure push was done by Next.js router
    const historyState = await page.evaluate(() => window.history.state);
    expect(historyState.__N).toBe(true);

    const link = page.locator('.ais-Hits-item a').first();
    await link.click();

    await expect(page).toHaveURL('http://localhost:3000/fr/other-page');

    await page.goBack();

    await expect(page).toHaveURL(urlWithRefinement);

    const checkbox = page.locator(
      '.ais-RefinementList-checkbox[value="Apple"]'
    );
    await expect(checkbox).toBeChecked();
  });
});
