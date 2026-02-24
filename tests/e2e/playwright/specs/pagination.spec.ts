import { test, expect } from '../fixtures';

test.describe('page navigation', () => {
  test('navigates pages and verifies results', async ({ page, helpers }) => {
    await page.goto('.');

    // Wait for hits to load
    await page.locator('.hit h1').first().waitFor();

    // Get page 1 results
    const page1Titles = await helpers.getHitsTitles();
    expect(page1Titles.length).toBeGreaterThan(0);
    const firstItemPage1 = page1Titles[0];

    // Navigate to next page
    await helpers.clickNextPage();

    // Must be on page 2
    let currentPage = await helpers.getCurrentPage();
    expect(currentPage).toEqual(2);

    // Wait for results to update (first item should change)
    await expect
      .poll(async () => {
        const titles = await helpers.getHitsTitles();
        return titles[0];
      })
      .not.toEqual(firstItemPage1);

    // Must have different results on page 2
    const page2Titles = await helpers.getHitsTitles();
    expect(page2Titles.length).toBeGreaterThan(0);
    expect(page2Titles[0]).not.toEqual(firstItemPage1);

    // Select "Appliances" in the category menu
    await helpers.clickHierarchicalMenuItem('Appliances');

    // Must reset the page to 1
    currentPage = await helpers.getCurrentPage();
    expect(currentPage).toEqual(1);

    // Wait for results to update
    await page.locator('.hit h1').first().waitFor();

    // Must have results for Appliances category
    const appliancesTitles = await helpers.getHitsTitles();
    expect(appliancesTitles.length).toBeGreaterThan(0);
    const firstItemAppliances = appliancesTitles[0];

    // Navigate to page 3
    await helpers.clickPage(3);

    // Must be on page 3
    currentPage = await helpers.getCurrentPage();
    expect(currentPage).toEqual(3);

    // Wait for results to update
    await expect
      .poll(async () => {
        const titles = await helpers.getHitsTitles();
        return titles[0];
      })
      .not.toEqual(firstItemAppliances);

    // Must have different results on page 3
    const page3Titles = await helpers.getHitsTitles();
    expect(page3Titles.length).toBeGreaterThan(0);
    expect(page3Titles[0]).not.toEqual(firstItemAppliances);
  });
});
