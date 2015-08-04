'use strict';

module.exports = {
  entry: './example/app.js',
  devtool: 'source-map',
  output: {
    path: './example/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'
    }, {
      test: /\.html$/, exclude: /node_modules/, loader: 'raw'
    }, {
      test: /\.css$/, loader: 'style-loader!css-loader'
    }]
  },
  devServer: {
    contentBase: 'example/'
  }
};
