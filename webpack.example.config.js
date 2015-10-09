var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

module.exports = {
  entry: {
    instantsearch: './index.js',
    app: './example/app.js'
  },
  devtool: 'source-map',
  output: {
    path: './example/',
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd'
  },
  plugins: [
    new CommonsChunkPlugin('commons-chunk.js')
  ],
  module: {
    loaders: [{
      test: /\.js$/, exclude: /node_modules/, loader: 'babel'
    }, {
      test: /\.html$/, exclude: /node_modules/, loader: 'raw'
    }]
  },
  devServer: {
    contentBase: 'example/',
    host: '0.0.0.0',
    compress: true
  }
};
