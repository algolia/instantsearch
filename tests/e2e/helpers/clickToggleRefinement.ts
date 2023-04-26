declare namespace WebdriverIOAsync {
  interface Browser {
    clickToggleRefinement: () => Promise<void>;
  }
}

browser.addCommand('clickToggleRefinement', async () => {
  const oldUrl = await browser.getUrl();
  const checkbox = await browser.$('.ais-ToggleRefinement-checkbox');
  // Assures us that the element is in the viewport
  await checkbox.scrollIntoView();

  await checkbox.click();

  // Changing the URL will also change the page element IDs in Internet Explorer
  // Not waiting for the URL to be properly updated before continuing can make the next tests fail
  await browser.waitUntil(
    async () => (await browser.getUrl()) !== oldUrl,
    undefined,
    `URL was not updated after click toggle refinement`
  );
});
