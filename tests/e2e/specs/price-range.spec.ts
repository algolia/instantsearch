describe('InstantSearch - Search on specific price range', () => {
  let lowerBound: number;
  let upperBound: number;

  it('navigates to the e-commerce demo', async () => {
    await browser.url('examples/e-commerce/');
  });

  it('drag and drop lower handle to the right', async () => {
    lowerBound = await browser.dragRangeSliderLowerBoundTo(30);
  });

  it(`waits for the results list to be updated (wait for all the prices to be > lowerBound)`, async () => {
    await browser.waitUntil(async () => {
      const hits = await browser.$$('.hit-info-container strong');
      const hitsText = await browser.getTextFromElements(hits);
      return (
        hitsText.filter(text => Number(text.replace(',', '')) < lowerBound)
          .length === 0
      );
    });
  });

  it('drag and drop upper handle to the left', async () => {
    upperBound = await browser.dragRangeSliderUpperBoundTo(70);
  });

  it(`waits for the results list to be updated (wait for all the prices to be < upperBound)`, async () => {
    await browser.waitUntil(async () => {
      const hits = await browser.$$('.hit-info-container strong');
      const hitsText = await browser.getTextFromElements(hits);
      return (
        hitsText.filter(text => Number(text.replace(',', '')) > upperBound)
          .length === 0
      );
    });
  });

  it('must have the expected results', async () => {
    const hitsTitles = await browser.getHitsTitles();

    expect(hitsTitles).toEqual([
      'Amazon - Fire TV Stick with Alexa Voice Remote - Black',
      'Google - Chromecast - Black',
      'Amazon - Echo Dot',
      'LG - Ultra Slim 8x Max. DVD Write Speed External USB DVD±RW/CD-RW Drive - Black',
      'AT&T GoPhone - Samsung Galaxy Express 3 4G LTE with 8GB Memory Prepaid Cell Phone',
      'Amazon - Echo Dot',
      'Insignia™ - Portable Wireless Speaker - Black',
      'SanDisk - Ultra Plus 32GB microSDHC Class 10 UHS-1 Memory Card - Gray/Red',
      'Philips - Hue White and Color Ambiance A19 Add-on Smart LED bulb (3rd Gen) - Multicolor',
      'SanDisk - Ultra Plus 32GB SDHC Class 10 UHS-1 Memory Card - Black/Gray/Red',
      'HP - 61 2-Pack Ink Cartridges - Black/Cyan/Magenta/Yellow',
      'HP - 62 2-Pack Ink Cartridges - Black/Tricolor',
      'SanDisk - Pixtor 32GB microSDHC Class 10 UHS-1 Memory Card - Gray/Red',
      'Amazon - Fire - 7" Tablet - 8GB - Black',
      'HP - 63 2-Pack Ink Cartridges - Black/Cyan/Magenta/Yellow',
      'DigiLand - 7" - Tablet - 16GB',
    ]);
  });
});
