const expect = require('chai').expect;

describe('InstantSearch e-commerce demo', () => {
  before(() => {
    browser.maximizeWindow();
  });

  it('must work', async () => {
    await browser.url('http://localhost:5000/examples/e-commerce/');

    // Select "Apple" brand in list
    const brand = await browser.$('span=Apple');
    await brand.click();

    // Fill search input with "macbook"
    const searchInput = await browser.$('[type=search]');
    await searchInput.setValue('macbook');

    // Wait for the results list to be updated (wait for the "macbook" word to be highlighted)
    await browser.waitUntil(
      async () => (await browser.$$('mark=MacBook')).length > 0,
      10000
    );

    // Get title for each result
    const hits = await browser.$$('.hit h1');
    const hitsText = await Promise.all(hits.map(hit => hit.getText()));

    // Compare them to expected titles
    expect(hitsText).to.deep.equal([
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
