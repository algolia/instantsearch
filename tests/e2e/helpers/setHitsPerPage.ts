declare namespace WebdriverIOAsync {
  interface Browser {
    setHitsPerPage: (label: string) => Promise<void>;
  }
}

browser.addCommand('setHitsPerPage', async (label: string) => {
  const oldUrl = await browser.getUrl();
  const hitsPerPage = await browser.$('.ais-HitsPerPage-select');

  await hitsPerPage.selectByVisibleText(label);

  // Changing the URL will also change the page element IDs in Internet Explorer
  // Not waiting for the URL to be properly updated before continuing can make the next tests fail
  await browser.waitUntil(
    async () => (await browser.getUrl()) !== oldUrl,
    undefined,
    `URL was not updated after setting hits per page to "${label}"`
  );
});
