declare namespace WebdriverIOAsync {
  interface Browser {
    getRangeSliderLowerBoundValue(): Promise<number>;
  }
}

browser.addCommand('getRangeSliderLowerBoundValue', async () => {
  const lowerHandle = await browser.$(
    '.ais-RangeSlider .rheostat-handle-lower'
  );
  return Number(await lowerHandle.getAttribute('aria-valuenow'));
});
