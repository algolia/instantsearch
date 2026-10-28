declare namespace WebdriverIOAsync {
  interface Browser {
    setSortByValue: (label: string) => Promise<void>;
  }
}

browser.addCommand('setSortByValue', async (label: string) => {
  const oldUrl = await browser.getUrl();
  const sortBy = await browser.$('.ais-SortBy-select');

  await sortBy.selectByVisibleText(label);

  // Not waiting for the URL to be properly updated before continuing can make the next tests fail
  await browser.waitUntil(
    async () => (await browser.getUrl()) !== oldUrl,
    undefined,
    `URL was not updated after setting sort by to "${label}"`
  );
});
