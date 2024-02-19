declare namespace WebdriverIOAsync {
  interface Browser {
    setSearchBoxValue: (value: string) => Promise<void>;
  }
}

browser.addCommand('setSearchBoxValue', async (value: string) => {
  const oldUrl = await browser.getUrl();
  const searchBox = await browser.$('.ais-SearchBox [type=search]');
  const resetButton = await browser.$('.ais-SearchBox [type=reset]');

  // Assures us that the element is in the viewport
  await searchBox.scrollIntoView();

  // Click the reset button to clear the input
  if (await resetButton.isDisplayed()) {
    // The reset button is invisible when nothing to reset
    await resetButton.click();
  }

  // In Internet Explorer the input must be focused before updating its value
  await searchBox.click();
  await searchBox.setValue(value);

  // Changing the URL will also change the page element IDs in Internet Explorer
  // Not waiting for the URL to be properly updated before continuing can make the next tests fail
  await browser.waitUntil(
    async () => {
      const newUrl = await browser.getUrl();
      return newUrl !== oldUrl && newUrl.includes(value);
    },
    undefined,
    `URL was not updated after setting searchbox value to "${value}"`
  );
});
