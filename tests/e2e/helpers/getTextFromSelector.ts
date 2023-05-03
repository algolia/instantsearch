declare namespace WebdriverIOAsync {
  interface Browser {
    getTextFromSelector: (selector: string) => Promise<string[]>;
  }
}

browser.addCommand('getTextFromSelector', (selector: string) => {
  return browser.execute(function (browserSelector) {
    const elements = document.querySelectorAll(browserSelector);

    return Array.prototype.slice.call(elements).map(function (el) {
      return el.innerText;
    });
  }, selector);
});
