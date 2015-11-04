import webpack from 'webpack';

export default {
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
    }, {
      test: require.resolve('react'), loader: 'expose?React'
    }, {
      test: require.resolve('react-dom'), loader: 'expose?ReactDOM'
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
