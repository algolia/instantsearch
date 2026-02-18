import { test, expect } from '../fixtures';

test.describe('search on specific brand and query filtering', () => {
  test('navigates to the e-commerce demo and filters by brand and query', async ({
    page,
    helpers,
  }) => {
    await page.goto('.');

    await helpers.clickRefinementListItem('Apple');

    await helpers.setSearchBoxValue('macbook');

    // Wait for the results list to be updated (wait for the "macbook" word to be highlighted)
    await page.locator('mark', { hasText: 'MacBook' }).first().waitFor();

    const hitsTitles = await helpers.getHitsTitles();

    expect(hitsTitles).toEqual([
      'Apple - MacBook Air® (Latest Model) - 13.3" Display - Intel Core i5 - 8GB Memory - 128GB Flash Storage - Silver',
      'Apple - MacBook Air® (Latest Model) - 13.3" Display - Intel Core i5 - 8GB Memory - 256GB Flash Storage - Silver',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M3 - 8GB Memory - 256GB Flash Storage - Space Gray',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M3 - 8GB Memory - 256GB Flash Storage - Gold',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M3 - 8GB Memory - 256GB Flash Storage - Rose Gold',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M3 - 8GB Memory - 256GB Flash Storage - Silver',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M5 - 8GB Memory - 512GB Flash Storage - Space Gray',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M5 - 8GB Memory - 512GB Flash Storage - Rose Gold',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M5 - 8GB Memory - 512GB Flash Storage - Gold',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M5 - 8GB Memory - 512GB Flash Storage - Silver',
      'Apple - MacBook Pro with Retina display - 13.3" Display - 8GB Memory - 128GB Flash Storage - Silver',
      'Apple - MacBook Pro®  - 13" Display - Intel Core i5 - 8 GB Memory - 256GB Flash Storage (latest model) - Space Gray',
      'Apple - MacBook® Pro - 15.4" Display - Intel Core i7 - 16GB Memory - 256GB Flash Storage - Silver',
      'Apple - MacBook Pro®  - 13" Display - Intel Core i5 - 8 GB Memory - 256GB Flash Storage (latest model) - Silver',
      'Apple - MacBook® Pro - Intel Core i5 - 13.3" Display - 4GB Memory - 500GB Hard Drive - Silver',
      'Apple - MacBook Pro 13.3" Refurbished Laptop - Intel Core i5 - 4GB Memory - 320GB - Silver',
    ]);
  });
});
