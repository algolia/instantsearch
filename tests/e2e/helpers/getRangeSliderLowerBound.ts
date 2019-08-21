declare namespace WebdriverIOAsync {
  interface Browser {
    getRangeSliderLowerBound(): Promise<number>;
  }
}

browser.addCommand('getRangeSliderLowerBound', async () => {
  const lowerHandle = await browser.$(
    '.ais-RangeSlider .rheostat-handle-lower'
  );
  return Number(await lowerHandle.getAttribute('aria-valuenow'));
});
