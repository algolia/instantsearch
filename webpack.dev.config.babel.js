export default {
  entry: {
    bundle: './dev/app.js',
    instantsearch: './index.js'
  },
  devtool: 'source-map',
  output: {
    path: './dev/',
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.js$/, exclude: /node_modules/, loader: 'babel'
    }, {
      test: /\.html$/, exclude: /node_modules/, loader: 'raw'
    }]
  },
  devServer: {
    contentBase: 'dev/',
    host: '0.0.0.0',
    compress: true
  }
};
