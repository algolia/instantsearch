declare namespace WebdriverIOAsync {
  interface Browser {
    getHitsTitles(): Promise<string[]>;
  }
}

browser.addCommand('getHitsTitles', async () =>
  browser.getTextFromElements(await browser.$$('.hit h1'))
);
