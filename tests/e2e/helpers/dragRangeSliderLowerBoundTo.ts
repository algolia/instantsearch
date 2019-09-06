declare namespace WebdriverIOAsync {
  interface Browser {
    dragRangeSliderLowerBoundTo(value: number): Promise<number>;
  }
}

browser.addCommand('dragRangeSliderLowerBoundTo', async (value: number) => {
  const slider = await browser.$('.rheostat-horizontal');
  let lowerHandle = await browser.$('.ais-RangeSlider .rheostat-handle-lower');
  const upperHandle = await browser.$(
    '.ais-RangeSlider .rheostat-handle-upper'
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

  // Depending of the steps calculation there can be a difference between
  // the wanted value and the actual value of the slider, so we return
  // the actual value in case we need it in the rest of the tests
  lowerHandle = await browser.$('.ais-RangeSlider .rheostat-handle-lower');
  return Number(await lowerHandle.getAttribute('aria-valuenow'));
});
