import { test, expect } from '@playwright/test';

test.describe('refining InstantSearch causes only one onStateChange', () => {
  test.describe('Next.js Link', () => {
    test('works when not on a i18n route', async ({ page }) => {
      await page.goto('/test');

      const navigationLink = page.locator('a', { hasText: 'Prefilled query' });
      await navigationLink.click();

      await page.waitForURL(
        'http://localhost:3000/test?instant_search%5Bquery%5D=apple'
      );

      const searchInput = page.locator('.ais-SearchBox-input');
      await expect(searchInput).toHaveValue('apple');

      const output = page.locator('output#onStateChange');
      await expect(output).toHaveText('1');
    });

    test('works when on a i18n route', async ({ page }) => {
      await page.goto('/fr/test');

      const navigationLink = page.locator('a', { hasText: 'Prefilled query' });
      await navigationLink.click();

      await page.waitForURL(
        'http://localhost:3000/fr/test?instant_search%5Bquery%5D=apple'
      );

      const searchInput = page.locator('.ais-SearchBox-input');
      await expect(searchInput).toHaveValue('apple');

      const output = page.locator('output#onStateChange');
      await expect(output).toHaveText('1');
    });
  });

  test.describe('InstantSearch', () => {
    test('works when not on a i18n route', async ({ page }) => {
      await page.goto('/test');

      const refinementLink = page.locator('.ais-RefinementList-labelText', {
        hasText: 'Apple',
      });
      await refinementLink.click();

      await page.waitForURL(
        'http://localhost:3000/test?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple'
      );

      const output = page.locator('output#onStateChange');
      await expect(output).toHaveText('1');
    });

    test('works when on a i18n route', async ({ page }) => {
      await page.goto('/fr/test');

      const refinementLink = page.locator('.ais-RefinementList-labelText', {
        hasText: 'Apple',
      });
      await refinementLink.click();

      await page.waitForURL(
        'http://localhost:3000/fr/test?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple'
      );

      const output = page.locator('output#onStateChange');
      await expect(output).toHaveText('1');
    });
  });
});
