import webpack from 'webpack';
import {join} from 'path';
import autoprefixer from 'autoprefixer';
import config from './config.js';

export default {
  entry: {
    'js/main': join(__dirname, 'assets/js/main.js'),
  },
  devtool: 'source-map',
  output: {
    path: config.docsDist,
    publicPath: config.publicPath,
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.json$/, loader: 'json',
      },
      {
        test: /\.js$/, exclude: /node_modules/, loader: 'babel',
      },
      {
        test: /\.scss$/,
        loaders: ['style?insertAt=top', 'css', 'postcss', 'sass'],
      },
    ],
  },
  
  postcss: [autoprefixer()],
  resolve: {
    alias: {
      'react-instantsearch': join(__dirname, '../packages/react-instantsearch/'),
      'react-instantsearch-theme-algolia': join(__dirname, '../packages/react-instantsearch-theme-algolia/'),
    },
  },
  // replace usage of process.env.NODE_ENV with the actual NODE_ENV from command line
  // when building. Some modules might be using it, this way we will reduce the code output when
  // NODE_ENV === 'production' and NODE_ENV=production was used to build
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
};
