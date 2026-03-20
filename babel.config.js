/**
 * Babel configuration for Storybook only.
 * Build transpilation is handled by SWC via rollup-plugin-swc3.
 * Test transpilation is handled by Vite via Vitest.
 *
 * @param {Object} api - Babel config API.
 * @returns {Object} Babel config.
 */
module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'classic' }],
      [
        '@babel/preset-env',
        {
          modules: false,
          // Ensure optional chaining/nullish coalescing are transformed
          targets: {
            ie: 11,
          },
        },
      ],
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
    ],
  };
};
