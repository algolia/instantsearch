declare namespace WebdriverIOAsync {
  interface Browser {
    getRangeSliderUpperBoundValue(): Promise<number>;
  }
}

browser.addCommand('getRangeSliderUpperBoundValue', async () => {
  await browser.waitForElement('.slider-handle, .rheostat-handle');
  const [, upperHandle] = await browser.$$('.slider-handle, .rheostat-handle');
  return Number(await upperHandle.getAttribute('aria-valuenow'));
});
