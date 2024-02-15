declare namespace WebdriverIOAsync {
  interface Browser {
    getSortByValue: () => Promise<string>;
  }
}

browser.addCommand('getSortByValue', async () => {
  const sortBy = await browser.$('.ais-SortBy-select');

  return sortBy.getValue();
});
