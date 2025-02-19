const ALL_FLAVORS = ['js', 'js-umd', 'react', 'vue'];

module.exports = {
  ALL_FLAVORS,
  /**
   * Returns the list of flavors to be tested on.
   * When E2E_FLAVOR is set, it only tests the requested flavor.
   * When it is not set, it will tests all flavors.
   *
   * @returns The list of flavors to be tested on
   */
  getFilteredFlavors() {
    return process.env.E2E_FLAVOR
      ? ALL_FLAVORS.filter((flavor) => flavor === process.env.E2E_FLAVOR)
      : ALL_FLAVORS;
  },
};
