module.exports = {
  entry: './index.js',
  output: {
    path: './dist/',
    filename: 'instantsearch.js',
    library: 'instantSearch',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'
    }]
  }
};
