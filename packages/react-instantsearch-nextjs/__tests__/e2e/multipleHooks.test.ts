import { test, expect } from '@playwright/test';

test.describe('multiple hooks in a single component', () => {
  test('only renders first hook if skipSuspense not set to true', async ({
    page,
  }) => {
    await page.goto('/multiple-hooks');

    const withoutSkipSuspense = page.locator('#without-skip-suspense');
    await expect(withoutSkipSuspense.locator('li')).toHaveCount(1);
  });

  test('only renders hooks properly if skipSuspense set to true', async ({
    page,
  }) => {
    await page.goto('/multiple-hooks');

    const withSkipSuspense = page.locator('#with-skip-suspense');
    await expect(withSkipSuspense.locator('li')).toHaveCount(2);
  });
});
