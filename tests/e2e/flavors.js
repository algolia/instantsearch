const ALL_FLAVORS = ['js', 'js-umd', 'react', 'vue'];

module.exports = {
  ALL_FLAVORS,
  /**
   * Returns the list of flavors to be tested on.
   * When E2E_FLAVOR is set, it only tests the requested flavor.
   * When it is not set, it will tests all flavors, except on Internet Explorer
   * where it will only test the JS flavors.
   *
   * @param {import("webdriverio").BrowserObject} browser The WebdriverIO browser object
   * @returns The list of flavors to be tested on
   */
  getFilteredFlavors(browser) {
    return ALL_FLAVORS.filter(
      !process.env.E2E_FLAVOR
        ? (flavor) =>
            browser.capabilities.browserName !== 'internet explorer'
              ? true
              : flavor.startsWith('js')
        : (flavor) => flavor === process.env.E2E_FLAVOR
    );
  },
};
