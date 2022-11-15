export function brandAndQuery(flavor: string) {
  const root = `examples/${flavor}/e-commerce/`;

  describe('Search on specific brand and query filtering', () => {
    it('navigates to the e-commerce demo', async () => {
      await browser.url(root);
    });

    it('selects "Apple" brand in list', async () => {
      await browser.clickRefinementListItem('Apple');
    });

    it('fills search input with "macbook"', async () => {
      await browser.setSearchBoxValue('macbook');
    });

    it('waits for the results list to be updated (wait for the "macbook" word to be highlighted)', async () => {
      await browser.waitForElement('mark=MacBook');
    });

    it('must have the expected results', async () => {
      const hitsTitles = await browser.getHitsTitles();

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
        'Apple - MacBook Pro® - 13" Display - Intel Core i5 - 8 GB Memory - 256GB Flash Storage (latest model) - Space Gray',
        'Apple - MacBook® Pro - 15.4" Display - Intel Core i7 - 16GB Memory - 256GB Flash Storage - Silver',
        'Apple - MacBook Pro® - 13" Display - Intel Core i5 - 8 GB Memory - 256GB Flash Storage (latest model) - Silver',
        'Apple - MacBook® Pro - Intel Core i5 - 13.3" Display - 4GB Memory - 500GB Hard Drive - Silver',
        'Apple - MacBook Pro 13.3" Refurbished Laptop - Intel Core i5 - 4GB Memory - 320GB - Silver',
      ]);
    });
  });
}
