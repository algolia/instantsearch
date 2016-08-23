import {resolve as r} from 'path';
import webpack from 'webpack';

const publicPath = 'http://localhost:8080/';

export default {
  entry: [
    `webpack-dev-server/client?${publicPath}`,
    'webpack/hot/only-dev-server',
    r('index.js'),
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
        include: [r('../src'), r('.'), r('../index.js')],
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    // Don't use --hot and this at the same time
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      __DOC__: JSON.stringify(false),
    }),
  ],
};
