declare namespace WebdriverIOAsync {
  interface Browser {
    clickRatingMenuItem: (label: string) => Promise<void>;
  }
}

browser.addCommand('clickRatingMenuItem', async (label: string) => {
  const oldUrl = await browser.getUrl();
  const rating = await browser.$(`.ais-RatingMenu-link[aria-label="${label}"]`);
  // Assures us that the element is in the viewport
  await rating.scrollIntoView();

  await rating.click();

  await browser.waitForElement(
    `.ais-RatingMenu-item--selected .ais-RatingMenu-link[aria-label="${label}"]`
  );

  // Changing the URL will also change the page element IDs in Internet Explorer
  // Not waiting for the URL to be properly updated before continuing can make the next tests fail
  await browser.waitUntil(
    async () => (await browser.getUrl()) !== oldUrl,
    undefined,
    `URL was not updated after click on "${label}" in rating menu`
  );
});
