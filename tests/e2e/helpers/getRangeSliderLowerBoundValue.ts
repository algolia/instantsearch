declare namespace WebdriverIOAsync {
  interface Browser {
    getRangeSliderLowerBoundValue(): Promise<number>;
  }
}

browser.addCommand('getRangeSliderLowerBoundValue', async () => {
  await browser.waitForElement('.slider-handle, .rheostat-handle');
  const [lowerHandle] = await browser.$$('.slider-handle, .rheostat-handle');
  return Number(await lowerHandle.getAttribute('aria-valuenow'));
});
