const webpack = require('webpack');

module.exports = ({ config, mode }) => {
  // `mode` can either be 'DEVELOPMENT' or 'PRODUCTION'
  // 'PRODUCTION' is used when building the static version of storybook.

  config.module.rules.push({
    test: /\.(js|ts|tsx)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
      },
    ],
  });

  console.log('webpack.config.js', {
    mode,
    'process.env.KEEP_DEPRECATION': process.env.KEEP_DEPRECATION,
    plugin: {
      __DEV__: JSON.stringify(mode === 'DEVELOPMENT'),
      __KEEP_DEPRECATION__: JSON.stringify(
        process.env.KEEP_DEPRECATION !== 'false'
      ),
    },
  });

  config.plugins.push(
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(mode === 'DEVELOPMENT'),
      __KEEP_DEPRECATION__: JSON.stringify(
        process.env.KEEP_DEPRECATION !== 'false'
      ),
    })
  );

  config.resolve.extensions.push('.ts', '.tsx');

  return config;
};
