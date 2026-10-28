import {
  RANGE_SLIDER_RAIL_SELECTOR,
  RANGE_SLIDER_HANDLE_SELECTOR,
} from './selectors';

declare module 'webdriverio' {
  interface Browser {
    dragRangeSliderLowerBoundTo: (value: number) => Promise<number>;
  }
}

browser.addCommand('dragRangeSliderLowerBoundTo', async (value: number) => {
  const oldUrl = await browser.getUrl();
  const slider = await browser.$(RANGE_SLIDER_RAIL_SELECTOR);

  await browser.waitForElement(RANGE_SLIDER_HANDLE_SELECTOR);
  let [lowerHandle, upperHandle] = await browser.$$(
    RANGE_SLIDER_HANDLE_SELECTOR
  );

  const { width: sliderWidth } = await slider.getSize();
  const { x: lowerHandleX } = await lowerHandle.getLocation();
  const { x: sliderX } = await slider.getLocation();
  const lowerHandleMin = Number(
    await lowerHandle.getAttribute('aria-valuemin')
  );
  const upperHandleMax = Number(
    await upperHandle.getAttribute('aria-valuemax')
  );

  // Get the size of a step (in pixels)
  const step = sliderWidth / (upperHandleMax - lowerHandleMin);
  // Get the horizontal difference between the handle and the slider (can happen if the handle have some margins)
  const xDifference = sliderX - lowerHandleX;
  // Calculate the final offset
  const offset = (value - lowerHandleMin) * step + xDifference;

  await browser.dragAndDropByOffset(lowerHandle, offset);

  await browser.waitForElement(RANGE_SLIDER_HANDLE_SELECTOR);

  // Not waiting for the URL to be properly updated before continuing can make the next tests fail
  await browser.waitUntil(
    async () => (await browser.getUrl()) !== oldUrl,
    undefined,
    `URL was not updated after dragging the range slider lower bound`
  );

  // Depending of the steps calculation there can be a difference between
  // the wanted value and the actual value of the slider, so we return
  // the actual value in case we need it in the rest of the tests
  [lowerHandle, upperHandle] = await browser.$$(RANGE_SLIDER_HANDLE_SELECTOR);
  return Number(await lowerHandle.getAttribute('aria-valuenow'));
});
