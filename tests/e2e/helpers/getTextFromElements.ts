declare namespace WebdriverIOAsync {
  interface Browser {
    getTextFromElements(
      elements: WebdriverIOAsync.Element[]
    ): Promise<string[]>;
  }
}

browser.addCommand('getTextFromElements', async function(
  elements: WebdriverIOAsync.Element[]
) {
  const texts = [];
  for (const element of elements) {
    texts.push(await element.getText());
  }
  return texts;
});
