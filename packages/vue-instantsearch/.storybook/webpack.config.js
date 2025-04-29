const webpack = require('webpack');

module.exports = ({ config, mode }) => {
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

  return config;
};
