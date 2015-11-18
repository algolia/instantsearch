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
    }, {
      test: require.resolve('react'), loader: 'expose?React'
    }, {
      test: require.resolve('react-dom'), loader: 'expose?ReactDOM'
    }]
  },
  devServer: {
    contentBase: 'dev/',
    host: '0.0.0.0',
    compress: true
  }
};
