export function createPriceRangeTestSuite(flavor: string) {
  const root = `examples/${flavor}/e-commerce/`;

  describe('search on specific price range', () => {
    let lowerBound: number;
    let upperBound: number;

    it('navigates to the e-commerce demo', async () => {
      await browser.url(root);
    });

    it('drag and drop lower handle to the right', async () => {
      lowerBound = await browser.dragRangeSliderLowerBoundTo(971);
    });

    it(`waits for the results list to be updated (wait for all the prices to be > lowerBound)`, async () => {
      await browser.waitUntil(
        async () => {
          const hitsText = await browser.getTextFromSelector(
            '.hit-info-container strong'
          );
          return (
            hitsText.filter(
              (text) => Number(text.replace(',', '')) < lowerBound
            ).length === 0
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
          const hitsText = await browser.getTextFromSelector(
            '.hit-info-container strong'
          );
          return (
            hitsText.filter(
              (text) => Number(text.replace(',', '')) > upperBound
            ).length === 0
          );
        },
        undefined,
        `Results list was not updated to display only hits with prices < ${upperBound}`
      );
    });
  });
}
