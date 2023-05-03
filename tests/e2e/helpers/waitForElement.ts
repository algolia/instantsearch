declare namespace WebdriverIOAsync {
  interface Browser {
    waitForElement: (selector: string) => Promise<boolean>;
  }
}

browser.addCommand('waitForElement', (selector: string) =>
  browser.waitUntil(
    async () => (await browser.$$(selector)).length > 0,
    undefined,
    `Element matching selector "${selector}" wasn't found`
  )
);
