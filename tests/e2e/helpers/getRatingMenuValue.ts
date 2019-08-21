declare namespace WebdriverIOAsync {
  interface Browser {
    getRatingMenuValue(): Promise<string>;
  }
}

browser.addCommand('getRatingMenuValue', async () => {
  const rating = await browser.$(
    '.ais-RatingMenu-item--selected .ais-RatingMenu-link'
  );

  return rating.getAttribute('aria-label');
});
