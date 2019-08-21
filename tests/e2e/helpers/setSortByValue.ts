declare namespace WebdriverIOAsync {
  interface Browser {
    setSortByValue(label: string): Promise<boolean>;
  }
}

browser.addCommand('setSortByValue', async (label: string) => {
  const sortBy = await browser.$('.ais-SortBy-select');

  return sortBy.selectByVisibleText(label);
});
