declare namespace WebdriverIOAsync {
  interface Browser {
    clickToggleRefinement(): Promise<boolean>;
  }
}

browser.addCommand('clickToggleRefinement', async () => {
  const checkbox = await browser.$('.ais-ToggleRefinement-checkbox');
  // Assures us that the element is in the viewport
  await checkbox.scrollIntoView();

  return checkbox.click();
});
