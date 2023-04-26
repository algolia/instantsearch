import { RANGE_SLIDER_HANDLE_SELECTOR } from './selectors';

declare module 'webdriverio' {
  interface Browser {
    getRangeSliderUpperBoundValue: () => Promise<number>;
  }
}

browser.addCommand('getRangeSliderUpperBoundValue', async () => {
  await browser.waitForElement(RANGE_SLIDER_HANDLE_SELECTOR);
  const [, upperHandle] = await browser.$$(RANGE_SLIDER_HANDLE_SELECTOR);
  return Number(await upperHandle.getAttribute('aria-valuenow'));
});
