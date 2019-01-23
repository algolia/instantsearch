const webpack = require('webpack');

module.exports = (_baseConfig, environment, defaultConfig) => {
  // `environment` can either be 'DEVELOPMENT' or 'PRODUCTION'
  // 'PRODUCTION' is used when building the static version of storybook.

  defaultConfig.module.rules.push({
    test: /\.(js|ts|tsx)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
      },
    ],
  });

  defaultConfig.plugins.push(
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(environment === 'DEVELOPMENT'),
    })
  );

  return defaultConfig;
};
