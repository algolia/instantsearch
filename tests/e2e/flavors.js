module.exports = {
  flavors: ['js', 'js-umd', 'react', 'vue'].filter(
    !process.env.E2E_FLAVOR
      ? Boolean
      : (flavor) => flavor === process.env.E2E_FLAVOR
  ),
};
