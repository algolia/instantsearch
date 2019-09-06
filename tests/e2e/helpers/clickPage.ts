declare namespace WebdriverIOAsync {
  interface Browser {
    clickPage(number: number): Promise<boolean>;
  }
}

browser.addCommand('clickPage', async (number: number) => {
  const page = await browser.$(`.ais-Pagination-link=${number}`);
  // Assures us that the element is in the viewport
  await page.scrollIntoView();

  await page.click();

  return browser.waitForElement(`.ais-Pagination-item--selected=${number}`);
});
