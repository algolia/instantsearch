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
              // Storybook 5 runs on webpack 4, whose parser can't handle modern
              // syntax (optional chaining, nullish coalescing). With no browser
              // targets, preset-env down-levels everything so webpack 4 can parse
              // it — including workspace deps built by SWC (see the storybook
              // webpack.config.js babel-loader rules).
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
