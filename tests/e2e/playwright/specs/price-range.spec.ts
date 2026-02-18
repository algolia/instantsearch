import { test, expect } from '../fixtures';

test.describe('search on specific price range', () => {
  test('filters by price range using slider', async ({ page, helpers }) => {
    await page.goto('.');

    // Drag and drop lower handle to the right
    const lowerBound = await helpers.dragRangeSliderLowerBoundTo(971);

    // Wait for the results list to be updated (wait for all the prices to be > lowerBound)
    await expect
      .poll(
        async () => {
          const hitsText = await helpers.getTextFromSelector(
            '.hit-info-container strong'
          );
          return hitsText.filter(
            (text) => Number(text.replace(',', '')) < lowerBound
          ).length;
        },
        {
          message: `Results list was not updated to display only hits with prices > ${lowerBound}`,
        }
      )
      .toBe(0);

    // Drag and drop upper handle to the left
    const upperBound = await helpers.dragRangeSliderUpperBoundTo(1971);

    // Wait for the results list to be updated (wait for all the prices to be < upperBound)
    await expect
      .poll(
        async () => {
          const hitsText = await helpers.getTextFromSelector(
            '.hit-info-container strong'
          );
          return hitsText.filter(
            (text) => Number(text.replace(',', '')) > upperBound
          ).length;
        },
        {
          message: `Results list was not updated to display only hits with prices < ${upperBound}`,
        }
      )
      .toBe(0);
  });
});
