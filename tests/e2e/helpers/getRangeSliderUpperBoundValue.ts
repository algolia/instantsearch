declare namespace WebdriverIOAsync {
  interface Browser {
    getRangeSliderUpperBoundValue(): Promise<number>;
  }
}

browser.addCommand('getRangeSliderUpperBoundValue', async () => {
  const upperHandle = await browser.$(
    '.ais-RangeSlider .rheostat-handle-upper'
  );
  return Number(await upperHandle.getAttribute('aria-valuenow'));
});
