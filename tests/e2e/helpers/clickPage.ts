declare namespace WebdriverIOAsync {
  interface Browser {
    clickPage: (number: number) => Promise<void>;
  }
}

browser.addCommand('clickPage', async (number: number) => {
  const oldUrl = await browser.getUrl();
  const page = await browser.$(`.ais-Pagination-link=${number}`);
  // Assures us that the element is in the viewport
  await page.scrollIntoView();

  await page.click();

  await browser.waitForElement(`.ais-Pagination-item--selected=${number}`);

  // Not waiting for the URL to be properly updated before continuing can make the next tests fail
  await browser.waitUntil(
    async () => (await browser.getUrl()) !== oldUrl,
    undefined,
    `URL was not updated after navigating to the page "${number}"`
  );
});
