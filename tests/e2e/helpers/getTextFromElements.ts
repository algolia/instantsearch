declare namespace WebdriverIOAsync {
  interface Browser {
    getTextFromElements(
      elements: WebdriverIOAsync.Element[]
    ): Promise<string[]>;
  }
}

browser.addCommand('getTextFromElements', function(
  elements: WebdriverIOAsync.Element[]
) {
  return browser.execute(function(browserElements) {
    return browserElements.map(function(browserElement: Element) {
      return browserElement.textContent || '';
    });
  }, elements);
});
