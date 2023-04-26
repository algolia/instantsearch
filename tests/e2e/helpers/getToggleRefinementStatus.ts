declare namespace WebdriverIOAsync {
  interface Browser {
    getToggleRefinementStatus: () => Promise<boolean>;
  }
}

browser.addCommand('getToggleRefinementStatus', async () => {
  const checkbox = await browser.$('.ais-ToggleRefinement-checkbox');

  return checkbox.isSelected();
});
