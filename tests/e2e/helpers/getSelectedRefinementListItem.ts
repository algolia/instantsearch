declare namespace WebdriverIOAsync {
  interface Browser {
    getSelectedRefinementListItem: () => Promise<string>;
  }
}

browser.addCommand('getSelectedRefinementListItem', async () => {
  const item = await browser.$(
    '.ais-RefinementList-item--selected .ais-RefinementList-labelText'
  );
  return await item.getText();
});
