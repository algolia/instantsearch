const webpack = require('webpack');

module.exports = ({ config, mode }) => {
  // `mode` can either be 'DEVELOPMENT' or 'PRODUCTION'
  // 'PRODUCTION' is used when building the static version of storybook.

  config.module.rules.push({
    test: /\.(js|ts|tsx)$/,
    // Transpile our own source plus workspace deps that ship modern syntax
    // (SWC-built `dist/es`, e.g. optional chaining) — webpack 4 can't parse it.
    exclude: /node_modules\/(?!(algoliasearch|instantsearch-ui-components)\/).*/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          rootMode: 'upward',
          envName: 'storybook',
        },
      },
    ],
  });

  config.plugins.push(
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(mode === 'DEVELOPMENT'),
    })
  );

  config.resolve.extensions.push('.ts', '.tsx');

  return config;
};
