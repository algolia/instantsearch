declare namespace WebdriverIOAsync {
  interface Browser {
    changeToggleRefinementStatus(): Promise<boolean>;
  }
}

browser.addCommand('changeToggleRefinementStatus', async () => {
  const checkbox = await browser.$('.ais-ToggleRefinement-checkbox');
  // Assures us that the element is in the viewport
  await checkbox.scrollIntoView();

  return checkbox.click();
});
