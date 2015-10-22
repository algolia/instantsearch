var webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    path: './dist/',
    filename: 'instantsearch.js',
    library: 'instantsearch',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.js$/, exclude: /node_modules/, loader: 'babel'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ]
};
