declare namespace WebdriverIOAsync {
  interface Browser {
    setNextPage(): Promise<boolean>;
  }
}

browser.addCommand('setNextPage', async () => {
  const pageNumber = await browser.getPage();
  const page = await browser.$(
    `.ais-Pagination-item--nextPage .ais-Pagination-link`
  );

  await page.click();

  return browser.waitForElement(
    `.ais-Pagination-item--selected=${pageNumber + 1}`
  );
});
