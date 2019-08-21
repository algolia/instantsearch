declare namespace WebdriverIOAsync {
  interface Browser {
    getRangeSliderUpperBound(): Promise<number>;
  }
}

browser.addCommand('getRangeSliderUpperBound', async () => {
  const upperHandle = await browser.$(
    '.ais-RangeSlider .rheostat-handle-upper'
  );
  return Number(await upperHandle.getAttribute('aria-valuenow'));
});
