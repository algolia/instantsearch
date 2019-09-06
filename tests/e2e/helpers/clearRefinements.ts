declare namespace WebdriverIOAsync {
  interface Browser {
    clearRefinements(): Promise<boolean>;
  }
}

browser.addCommand('clearRefinements', async () => {
  const clearButton = await browser.$(`.ais-ClearRefinements-button`);
  // Assures us that the element is in the viewport
  await clearButton.scrollIntoView();

  await clearButton.click();

  return browser.waitForElement(`.ais-ClearRefinements-button--disabled`);
});
