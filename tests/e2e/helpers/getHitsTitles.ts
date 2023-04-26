declare namespace WebdriverIOAsync {
  interface Browser {
    getHitsTitles: () => Promise<string[]>;
  }
}

browser.addCommand('getHitsTitles', () =>
  browser.getTextFromSelector('.hit h1')
);
