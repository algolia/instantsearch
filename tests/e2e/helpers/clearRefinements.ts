declare namespace WebdriverIOAsync {
  interface Browser {
    clearRefinements(): Promise<boolean>;
  }
}

browser.addCommand('clearRefinements', async () => {
  const clearButton = await browser.$(`.ais-ClearRefinements-button`);

  await clearButton.click();

  return browser.waitForElement(`.ais-ClearRefinements-button--disabled`);
});
