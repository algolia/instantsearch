const webpack = require('webpack');

module.exports = (_baseConfig, environment, defaultConfig) => {
  // `environment` can either be 'DEVELOPMENT' or 'PRODUCTION'
  // 'PRODUCTION' is used when building the static version of storybook.

  defaultConfig.plugins.push(
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(environment === 'DEVELOPMENT'),
    })
  );

  return defaultConfig;
};
