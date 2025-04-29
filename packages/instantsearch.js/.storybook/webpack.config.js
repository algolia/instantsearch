const webpack = require('webpack');

module.exports = ({ config, mode }) => {
  // `mode` can either be 'DEVELOPMENT' or 'PRODUCTION'
  // 'PRODUCTION' is used when building the static version of storybook.

  config.module.rules.push({
    test: /\.(js|ts|tsx)$/,
    exclude: /node_modules\/(?!(algoliasearch)\/).*/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          rootMode: 'upward',
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
