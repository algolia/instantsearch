declare namespace WebdriverIOAsync {
  interface Browser {
    setRatingMenuValue(label: string): Promise<boolean>;
  }
}

browser.addCommand('setRatingMenuValue', async (label: string) => {
  const rating = await browser.$(`.ais-RatingMenu-link[aria-label="${label}"]`);
  // Assures us that the element is in the viewport
  await rating.scrollIntoView();

  await rating.click();

  return browser.waitForElement(
    `.ais-RatingMenu-item--selected .ais-RatingMenu-link[aria-label="${label}"]`
  );
});
