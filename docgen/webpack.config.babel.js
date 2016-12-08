import webpack from 'webpack';
import {join} from 'path';
import autoprefixer from 'autoprefixer';
import config from './config.js';

export default {
  entry: {
    'js/main': join(__dirname, 'assets/js/main.js'),
    'examples/e-commerce/index': join(__dirname, 'src/examples/e-commerce/index.js'),
    'examples/e-commerce-infinite/index': join(__dirname, 'src/examples/e-commerce-infinite/index.js'),
    'examples/media/index': join(__dirname, 'src/examples/media/index.js'),
    'examples/default-theme/index': join(__dirname, 'src/examples/default-theme/index.js'),
    'examples/tourism/index': join(__dirname, 'src/examples/tourism/index.js'),
    'examples/material-ui/index': join(__dirname, 'src/examples/material-ui/index.js'),
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
        test: /\.json$/, exclude: /node_modules/, loader: 'json',
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
