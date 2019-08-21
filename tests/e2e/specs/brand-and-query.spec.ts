describe('InstantSearch - Search on specific brand and query filtering', () => {
  it('navigates to the e-commerce demo', async () => {
    await browser.url('examples/e-commerce/');
  });

  it('selects "Apple" brand in list', async () => {
    const brand = await browser.$('.ais-RefinementList-labelText=Apple');
    await brand.click();

    // Changing the URL will also change the page element IDs in Internet Explorer
    // Not waiting for the URL to be properly updated before continuing can make the tests to fail
    await browser.waitUntil(async () =>
      (await browser.getUrl()).includes('brands=Apple')
    );
  });

  it('fills search input with "macbook"', async () => {
    const searchInput = await browser.$('[type=search]');
    // In Internet Explorer the input must be focused before updating its value
    await searchInput.click();
    await searchInput.setValue('macbook');

    await browser.waitUntil(async () =>
      (await browser.getUrl()).includes('query=macbook')
    );
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
