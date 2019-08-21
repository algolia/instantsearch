declare namespace WebdriverIOAsync {
  interface Browser {
    setSearchBoxValue(value: string): Promise<boolean>;
  }
}

browser.addCommand('setSearchBoxValue', async (value: string) => {
  const oldUrl = await browser.getUrl();
  const searchBox = await browser.$('.ais-SearchBox [type=search]');
  // In Internet Explorer the input must be focused before updating its value
  await searchBox.click();
  await searchBox.setValue(value);

  // Changing the URL will also change the page element IDs in Internet Explorer
  // Not waiting for the URL to be properly updated before continuing can make the next tests to fail
  return browser.waitUntil(async () => (await browser.getUrl()) !== oldUrl);
});
