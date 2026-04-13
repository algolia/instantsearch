import { RANGE_SLIDER_HANDLE_SELECTOR } from './selectors';

declare module 'webdriverio' {
  interface Browser {
    getRangeSliderUpperBoundValue: () => Promise<number>;
  }
}

browser.addCommand('getRangeSliderUpperBoundValue', async () => {
  await browser.waitForElement(RANGE_SLIDER_HANDLE_SELECTOR);
  return Number(
    await browser.waitUntil(async () => {
      try {
        const handles = await browser.$$(RANGE_SLIDER_HANDLE_SELECTOR);
        return await handles[1].getAttribute('aria-valuenow');
      } catch {
        return false;
      }
    })
  );
});
