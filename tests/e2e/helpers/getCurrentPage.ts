declare namespace WebdriverIOAsync {
  interface Browser {
    getCurrentPage: () => Promise<number>;
  }
}

browser.addCommand('getCurrentPage', async () => {
  const page = await browser.$('.ais-Pagination-item--selected');

  return Number(await page.getText());
});
