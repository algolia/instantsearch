import {resolve as r} from 'path';

const publicPath = 'http://localhost:8080/';

export default {
  entry: [
    `webpack-dev-server/client?${publicPath}`,
    'webpack/hot/only-dev-server',
    r('examples/index.js'),
  ],

  devtool: 'cheap-module-eval-source-map',

  output: {
    path: r('dist'),
    filename: 'bundle.js',
    publicPath,
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        include: [r('src'), r('examples'), r('node_modules/algoliasearch-helper-provider/src')],
      },
    ],
  },

  plugins: [
    // Don't use --hot and this at the same time
    // new webpack.HotModuleReplacementPlugin(),
  ],
};
