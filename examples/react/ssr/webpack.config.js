const path = require('path');

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = (_, { mode }) => {
  const common = {
    mode: 'development',
    plugins: [new webpack.DefinePlugin({ __DEV__: mode !== 'production' })],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(algoliasearch|@algolia)\/).*/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                rootMode: 'upward',
              },
            },
          ],
        },
      ],
    },
  };

  return [
    {
      ...common,
      entry: ['@babel/polyfill', './src/server.js'],
      output: {
        path: path.join(__dirname, 'dist'),
        filename: 'server.js',
        libraryTarget: 'commonjs2',
        publicPath: '/',
      },
      target: 'node',
      node: {
        console: false,
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
      },
      externals: nodeExternals(),
    },
    {
      ...common,
      entry: ['@babel/polyfill', './src/browser.js'],
      output: {
        path: path.join(__dirname, 'dist/assets'),
        publicPath: '/',
        filename: 'bundle.js',
      },
      resolve: {
        extensions: ['.js', '.jsx'],
      },
    },
  ];
};
