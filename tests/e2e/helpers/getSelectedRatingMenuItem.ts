declare namespace WebdriverIOAsync {
  interface Browser {
    getSelectedRatingMenuItem: () => Promise<string>;
  }
}

browser.addCommand('getSelectedRatingMenuItem', async () => {
  const rating = await browser.$(
    '.ais-RatingMenu-item--selected .ais-RatingMenu-link'
  );

  return rating.getAttribute('aria-label');
});
