declare namespace WebdriverIOAsync {
  interface Browser {
    setPreviousPage(): Promise<boolean>;
  }
}

browser.addCommand('setPreviousPage', async () => {
  const pageNumber = await browser.getPage();
  const page = await browser.$(
    `.ais-Pagination-item--previousPage .ais-Pagination-link`
  );

  await page.click();

  return browser.waitForElement(
    `.ais-Pagination-item--selected=${pageNumber - 1}`
  );
});
