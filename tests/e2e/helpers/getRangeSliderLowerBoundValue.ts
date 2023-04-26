import { RANGE_SLIDER_HANDLE_SELECTOR } from './selectors';

declare module 'webdriverio' {
  interface Browser {
    getRangeSliderLowerBoundValue: () => Promise<number>;
  }
}

browser.addCommand('getRangeSliderLowerBoundValue', async () => {
  await browser.waitForElement(RANGE_SLIDER_HANDLE_SELECTOR);
  const [lowerHandle] = await browser.$$(RANGE_SLIDER_HANDLE_SELECTOR);
  return Number(await lowerHandle.getAttribute('aria-valuenow'));
});
