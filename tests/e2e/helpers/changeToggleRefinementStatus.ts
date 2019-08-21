declare namespace WebdriverIOAsync {
  interface Browser {
    changeToggleRefinementStatus(): Promise<boolean>;
  }
}

browser.addCommand('changeToggleRefinementStatus', async () => {
  const checkbox = await browser.$('.ais-ToggleRefinement-checkbox');

  return checkbox.click();
});
