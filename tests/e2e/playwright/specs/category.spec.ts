import { test, expect } from '../fixtures';

test.describe('search on specific category', () => {
  test('navigates categories and verifies results', async ({
    page,
    helpers,
  }) => {
    await page.goto('.');

    // Wait for initial hits to load
    await page.locator('.hit h1').first().waitFor();

    // Get initial results
    const initialTitles = await helpers.getHitsTitles();
    expect(initialTitles.length).toBeGreaterThan(0);

    // Select Appliances category
    await helpers.clickHierarchicalMenuItem('Appliances');

    // Verify URL contains Appliances path
    await expect(page).toHaveURL(/search\/Appliances\//);

    // Get results after selecting Appliances
    let hitsTitles = await helpers.getHitsTitles();
    expect(hitsTitles.length).toBeGreaterThan(0);

    // Select Small Kitchen Appliances subcategory
    await helpers.clickHierarchicalMenuItem('Small Kitchen Appliances');

    // Verify URL contains full path
    await expect(page).toHaveURL(/search\/Appliances%2FSmall\+Kitchen\+Appliances\//);

    // Get results for "Small Kitchen Appliances"
    const smallKitchenTitles = await helpers.getHitsTitles();
    expect(smallKitchenTitles.length).toBeGreaterThan(0);

    // Unselect "Small Kitchen Appliances" category in list
    await helpers.clickHierarchicalMenuItem('Small Kitchen Appliances');

    // Verify URL now only contains Appliances
    await expect(page).toHaveURL(/search\/Appliances\/$/);

    // Results should be different (broader category = more results)
    const appliancesTitles = await helpers.getHitsTitles();
    expect(appliancesTitles.length).toBeGreaterThan(0);
  });
});
