describe('InstantSearch - Search on specific price range', () => {
  let lowerBound: number;
  let upperBound: number;

  it('navigates to the e-commerce demo', async () => {
    await browser.url('examples/e-commerce/');
  });

  it('drag and drop lower handle to the right', async () => {
    lowerBound = await browser.dragRangeSliderLowerBoundTo(971);
  });

  it(`waits for the results list to be updated (wait for all the prices to be > lowerBound)`, async () => {
    await browser.waitUntil(
      async () => {
        const hits = await browser.$$('.hit-info-container strong');
        const hitsText = await browser.getTextFromElements(hits);
        return (
          hitsText.filter(text => Number(text.replace(',', '')) < lowerBound)
            .length === 0
        );
      },
      undefined,
      `Results list was not updated to display only hits with prices > ${lowerBound}`
    );
  });

  it('drag and drop upper handle to the left', async () => {
    upperBound = await browser.dragRangeSliderUpperBoundTo(1971);
  });

  it(`waits for the results list to be updated (wait for all the prices to be < upperBound)`, async () => {
    await browser.waitUntil(
      async () => {
        const hits = await browser.$$('.hit-info-container strong');
        const hitsText = await browser.getTextFromElements(hits);
        return (
          hitsText.filter(text => Number(text.replace(',', '')) > upperBound)
            .length === 0
        );
      },
      undefined,
      `Results list was not updated to display only hits with prices < ${upperBound}`
    );
  });

  it('must have the expected results', async () => {
    const hitsTitles = await browser.getHitsTitles();

    expect(hitsTitles).toEqual([
      'Apple - MacBook Air® (Latest Model) - 13.3" Display - Intel Core i5 - 8GB Memory - 128GB Flash Storage - Silver',
      'Apple - MacBook Pro with Retina display - 13.3" Display - 8GB Memory - 128GB Flash Storage - Silver',
      'Apple - MacBook Air® (Latest Model) - 13.3" Display - Intel Core i5 - 8GB Memory - 256GB Flash Storage - Silver',
      'Sony - 65" Class (64.5" Diag.) - 2160p - Smart - 4K Ultra HD TV with High Dynamic Range - Black',
      'Apple - MacBook Pro® - 13" Display - Intel Core i5 - 8 GB Memory - 256GB Flash Storage (latest model) - Space Gray',
      'Samsung - 65" Class (64.5" Diag.) - LED - 2160p - Smart - 4K Ultra HD TV - with High Dynamic Range - Silver',
      'Sony - 55" Class (54.6" Diag.) - 2160p - Smart - 4K Ultra HD TV with High Dynamic Range - Black',
      'HP - Spectre x360 2-in-1 15.6" 4K Ultra HD Touch-Screen Laptop - Intel Core i7 - 16GB Memory - 256GB Solid State Drive - Natural Silver',
      'Microsoft - Surface Pro 4 - 12.3" - 128GB - Intel Core i5 - Silver',
      'Samsung - 49" Class - (48.5" Diag.) - LED - 2160p - Smart - 4K Ultra HD TV - with High Dynamic Range - Silver',
      'Samsung - 55" Class - (54.6" Diag.) - LED - 2160p - Smart - 4K Ultra HD TV - with High Dynamic Range - Silver',
      'HP - ENVY 17.3" Touch-Screen Laptop - Intel Core i7 - 16GB Memory - 1TB Hard Drive - Natural Silver',
      'HP - Pavilion 27" Touch-Screen All-In-One - Intel Core i7 - 12GB Memory - 1TB Hard Drive - HP finish in turbo silver',
      'Samsung - 65" Class - (64.5" Diag.) - LED - 2160p - Smart - 4K Ultra HD TV with High Dynamic Range - Black',
      'Sony - 55" Class (54.6" diag) - LED - 2160p - Smart - 3D - 4K Ultra HD TV with High Dynamic Range - Black',
      'HP - OMEN 17.3" Laptop - Intel Core i7 - 12GB Memory - NVIDIA GeForce GTX 965M - 1TB HDD + 256GB Solid State Drive - Onyx Black/Twinkle Black',
    ]);
  });
});
