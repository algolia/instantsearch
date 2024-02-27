/**
 * Returns the list of flavors to be tested on.
 * When E2E_FLAVOR is set, it only tests the requested flavor.
 * When it is not set, it will tests all flavors, except on Internet Explorer
 * where it will only test the JS flavors.
 */
module.exports = {
  flavors: ['js', 'js-umd', 'react', 'vue'].filter(
    !process.env.E2E_FLAVOR
      ? (flavor) =>
          process.env.E2E_BROWSER !== 'internet explorer'
            ? true
            : flavor.startsWith('js')
      : (flavor) => flavor === process.env.E2E_FLAVOR
  ),
};
