declare namespace WebdriverIOAsync {
  interface Browser {
    setHitsPerPage(label: string): Promise<boolean>;
  }
}

browser.addCommand('setHitsPerPage', async (label: string) => {
  const hitsPerPage = await browser.$('.ais-HitsPerPage-select');

  return hitsPerPage.selectByVisibleText(label);
});
