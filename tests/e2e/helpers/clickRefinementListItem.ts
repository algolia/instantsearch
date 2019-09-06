declare namespace WebdriverIOAsync {
  interface Browser {
    clickRefinementListItem(label: string): Promise<boolean>;
  }
}

browser.addCommand('clickRefinementListItem', async (label: string) => {
  const oldUrl = await browser.getUrl();
  const item = await browser.$(`.ais-RefinementList-labelText=${label}`);
  // Assures us that the element is in the viewport
  await item.scrollIntoView();

  await item.click();

  // Changing the URL will also change the page element IDs in Internet Explorer
  // Not waiting for the URL to be properly updated before continuing can make the next tests to fail
  return browser.waitUntil(async () => (await browser.getUrl()) !== oldUrl);
});
