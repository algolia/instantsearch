/**
 * Babel configuration for Jest tests only.
 * Build transpilation is now handled by SWC via rollup-plugin-swc3.
 *
 * @param {Object} api - Babel config API.
 * @returns {Object} Babel config.
 */
module.exports = (api) => {
  const isStorybook = api.env('storybook');

  api.cache(true);

  return {
    presets: [
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'classic' }],
      [
        '@babel/preset-env',
        isStorybook
          ? {
              modules: false,
              // Ensure optional chaining/nullish coalescing are transformed
              targets: {
                ie: 11,
              },
            }
          : {
              modules: 'commonjs',
              targets: {
                node: true,
              },
            },
      ],
    ],
    plugins: [
      // Class properties for test files
      '@babel/plugin-proposal-class-properties',
    ],
  };
};
