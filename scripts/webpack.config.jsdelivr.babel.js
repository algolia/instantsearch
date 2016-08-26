import webpack from 'webpack';
import {join} from 'path';

export default {
  entry: './index.js',
  devtool: 'source-map',
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
  resolve: {
    fallback: [join(__dirname, '..', 'node_modules')],
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat'
    }
  },
  // same issue, for loaders like babel
  resolveLoader: {
    fallback: [join(__dirname, '..', 'node_modules')]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ]
};
