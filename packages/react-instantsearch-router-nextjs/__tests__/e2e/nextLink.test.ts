import { test, expect } from '@playwright/test';

test.describe('clicking on a Next.js link within the same page updates InstantSearch', () => {
  test('works when not on a i18n route', async ({ page }) => {
    await page.goto('/');

    const navigationLink = page.locator('a', { hasText: 'Prefilled query' });
    await navigationLink.click();

    await page.waitForURL(
      'http://localhost:3000/?instant_search%5Bquery%5D=apple'
    );

    const searchInput = page.locator('.ais-SearchBox-input');
    await expect(searchInput).toHaveValue('apple');
  });

  test('works when on a i18n route', async ({ page }) => {
    await page.goto('/fr');

    const navigationLink = page.locator('a', { hasText: 'Prefilled query' });
    await navigationLink.click();

    await page.waitForURL(
      'http://localhost:3000/fr?instant_search%5Bquery%5D=apple'
    );

    const searchInput = page.locator('.ais-SearchBox-input');
    await expect(searchInput).toHaveValue('apple');
  });
});
