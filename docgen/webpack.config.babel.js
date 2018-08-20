import webpack from 'webpack';
import { join } from 'path';
import autoprefixer from 'autoprefixer';
import config from './config';

export default {
  devtool: 'source-map',

  entry: {
    'js/main': join(__dirname, 'assets/js/main.js')
  },

  output: {
    path: config.docsDist,
    publicPath: config.publicPath,
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!algolia-frontend-components\/components)/,
        use: 'babel-loader'
      },
      {
        test: /\.s?(c|a)ss$/,
        use: [
          {loader: 'style-loader?insertAt=top', options: {sourceMap: true}},
          {loader: 'css-loader', options: {sourceMap: true}},
          {loader: 'postcss-loader', options: {sourceMap: true}},
          {loader: 'sass-loader', options: {sourceMap: true}}
        ]
      }
    ]
  },

  resolve: {
    alias: {
      'react-instantsearch': join(
        __dirname,
        '../packages/react-instantsearch/'
      ),
      'react-instantsearch-theme-algolia': join(
        __dirname,
        '../packages/react-instantsearch-theme-algolia/'
      )
    }
  },

  // replace usage of process.env.NODE_ENV with the actual NODE_ENV from command line
  // when building. Some modules might be using it, this way we will reduce the code output when
  // NODE_ENV === 'production' and NODE_ENV=production was used to build
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ]
};
