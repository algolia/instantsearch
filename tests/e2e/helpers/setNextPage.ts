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
  // Assures us that the element is in the viewport
  await page.scrollIntoView();

  await page.click();

  return browser.waitForElement(
    `.ais-Pagination-item--selected=${pageNumber + 1}`
  );
});
