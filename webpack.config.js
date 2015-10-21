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
  }
};
