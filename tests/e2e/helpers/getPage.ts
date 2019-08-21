declare namespace WebdriverIOAsync {
  interface Browser {
    getPage(): Promise<number>;
  }
}

browser.addCommand('getPage', async () => {
  const page = await browser.$('.ais-Pagination-item--selected');

  return Number(await page.getText());
});
