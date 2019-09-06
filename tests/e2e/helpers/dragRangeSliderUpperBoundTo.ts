declare namespace WebdriverIOAsync {
  interface Browser {
    dragRangeSliderUpperBoundTo(value: number): Promise<number>;
  }
}

browser.addCommand('dragRangeSliderUpperBoundTo', async (value: number) => {
  const slider = await browser.$('.rheostat-horizontal');
  const lowerHandle = await browser.$(
    '.ais-RangeSlider .rheostat-handle-lower'
  );
  let upperHandle = await browser.$('.ais-RangeSlider .rheostat-handle-upper');
  const { width: sliderWidth } = await slider.getSize();
  const { x: upperHandleX } = await upperHandle.getLocation();
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
  const xDifference = sliderX + sliderWidth - upperHandleX;
  // Calculate the final offset
  const offset = (upperHandleMax - value) * step - xDifference;

  await browser.dragAndDropByOffset(upperHandle, -offset);

  // Depending of the steps calculation there can be a difference between
  // the wanted value and the actual value of the slider, so we return
  // the actual value in case we need it in the rest of the tests
  upperHandle = await browser.$('.ais-RangeSlider .rheostat-handle-upper');
  return Number(await upperHandle.getAttribute('aria-valuenow'));
});
