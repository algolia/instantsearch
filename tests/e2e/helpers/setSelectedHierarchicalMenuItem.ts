declare namespace WebdriverIOAsync {
  interface Browser {
    setSelectedHierarchicalMenuItem(label: string): Promise<boolean>;
  }
}

browser.addCommand('setSelectedHierarchicalMenuItem', async (label: string) => {
  const oldUrl = await browser.getUrl();
  const item = await browser.$(`.ais-HierarchicalMenu-label=${label}`);
  await item.click();

  // Changing the URL will also change the page element IDs in Internet Explorer
  // Not waiting for the URL to be properly updated before continuing can make the next tests to fail
  return browser.waitUntil(async () => (await browser.getUrl()) !== oldUrl);
});
