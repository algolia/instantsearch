/**
 * Babel configuration for Jest tests only.
 * Build transpilation is now handled by SWC via rollup-plugin-swc3.
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
