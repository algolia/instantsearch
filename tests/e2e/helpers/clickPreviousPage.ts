declare namespace WebdriverIOAsync {
  interface Browser {
    clickPreviousPage: () => Promise<void>;
  }
}

browser.addCommand('clickPreviousPage', async () => {
  const oldUrl = await browser.getUrl();
  const pageNumber = await browser.getCurrentPage();
  const page = await browser.$(
    `.ais-Pagination-item--previousPage .ais-Pagination-link`
  );
  // Assures us that the element is in the viewport
  await page.scrollIntoView();

  await page.click();

  await browser.waitForElement(
    `.ais-Pagination-item--selected=${pageNumber - 1}`
  );

  // Changing the URL will also change the page element IDs in Internet Explorer
  // Not waiting for the URL to be properly updated before continuing can make the next tests fail
  await browser.waitUntil(
    async () => (await browser.getUrl()) !== oldUrl,
    undefined,
    `URL was not updated after navigating to the previous page`
  );
});
