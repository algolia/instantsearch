declare namespace WebdriverIOAsync {
  interface Browser {
    clickClearRefinements: () => Promise<void>;
  }
}

browser.addCommand('clickClearRefinements', async () => {
  const oldUrl = await browser.getUrl();
  const clearButton = await browser.$(`.ais-ClearRefinements-button`);
  // Assures us that the element is in the viewport
  await clearButton.scrollIntoView();

  await clearButton.click();

  await browser.waitForElement(`.ais-ClearRefinements-button--disabled`);

  // Not waiting for the URL to be properly updated before continuing can make the next tests fail
  await browser.waitUntil(
    async () => (await browser.getUrl()) !== oldUrl,
    undefined,
    `URL was not updated after clearing the refinements`
  );
});
