import {join} from 'path';
import webpack from 'webpack';

export default {
  entry: {
    bundle: './dev/app/index.js',
    instantsearch: './index.js',
  },
  devtool: 'source-map',
  output: {
    path: './dev/',
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [{
      test: /\.js$/, exclude: /node_modules/, loader: 'babel',
    }, {
      test: /\.html$/, exclude: /node_modules/, loader: 'raw',
    }, {
      test: /\.scss$/, include: /src\/css\/theme/, loader: 'style!css!sass',
    }, {
      test: require.resolve('react'), loader: 'expose?React',
    }, {
      test: require.resolve('react-dom'), loader: 'expose?ReactDOM',
    }],
  },
  // when module not found, find locally first
  // helps fixing the npm link not working with webpack
  // http://stackoverflow.com/a/33722844/147079
  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
    },
    fallback: [join(__dirname, '..', 'node_modules')],
  },
  // same issue, for loaders like babel
  resolveLoader: {
    fallback: [join(__dirname, '..', 'node_modules')],
  },
  devServer: {
    contentBase: 'dev/',
    host: '0.0.0.0',
    compress: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
};
