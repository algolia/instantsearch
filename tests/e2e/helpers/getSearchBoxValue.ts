declare namespace WebdriverIOAsync {
  interface Browser {
    getSearchBoxValue: () => Promise<string>;
  }
}

browser.addCommand('getSearchBoxValue', async () => {
  const searchBox = await browser.$('.ais-SearchBox [type=search]');

  return searchBox.getValue();
});
