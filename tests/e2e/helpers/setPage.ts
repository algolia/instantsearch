declare namespace WebdriverIOAsync {
  interface Browser {
    setPage(number: number): Promise<boolean>;
  }
}

browser.addCommand('setPage', async (number: number) => {
  const page = await browser.$(`.ais-Pagination-link=${number}`);
  // Assures us that the element is in the viewport
  await page.scrollIntoView();

  await page.click();

  return browser.waitForElement(`.ais-Pagination-item--selected=${number}`);
});
