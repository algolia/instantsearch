export default {
  entry: './dev/app.js',
  devtool: 'source-map',
  output: {
    path: './dev/',
    filename: 'bundle.js'
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
