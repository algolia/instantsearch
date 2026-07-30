const webpack = require('webpack');

module.exports = ({ config, mode }) => {
  // Down-level modern JS syntax (optional chaining, nullish coalescing) that
  // Storybook 5.3.9 / webpack 4 can't parse. This hits the SWC-built workspace
  // deps (`instantsearch.js`, `instantsearch-ui-components`, `algoliasearch-helper`,
  // resolved via symlink to `packages/*` so their paths have no `node_modules/`)
  // and the `algoliasearch` vendor package. With no browser targets, preset-env
  // transpiles everything down so webpack 4 can parse it.
  //
  // IMPORTANT: Do NOT re-process Vue InstantSearch's own source. Its `.js`/SFC
  // files are already handled by Storybook's built-in babel-loader; a second
  // pass causes "export 'default' was not found" errors.
  config.module.rules.push({
    test: /\.js$/,
    exclude: (modulePath) =>
      /packages\/vue-instantsearch\/src\//.test(modulePath) ||
      /node_modules\/(?!(algoliasearch|instantsearch\.js|instantsearch-ui-components|algoliasearch-helper)\/).*/.test(
        modulePath
      ),
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    ],
  });

  config.plugins.push(
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(mode === 'DEVELOPMENT'),
    })
  );

  return config;
};
