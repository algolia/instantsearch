export default {
  entry: './source/javascripts/site.js',
  devtool: 'source-map',
  output: {
    path: './.webpack/js',
    filename: 'site.js'
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  }
};
