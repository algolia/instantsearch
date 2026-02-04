/**
 * Babel configuration for Jest tests only.
 * Build transpilation is now handled by SWC via rollup-plugin-swc3.
 */
module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      '@babel/preset-typescript',
      '@babel/preset-react',
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
