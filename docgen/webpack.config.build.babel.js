// this is the webpack config when running `npm run docs:build`

import webpack from 'webpack';
import webpackConfig from './webpack.config.babel.js';

const {
  optimize: {OccurenceOrderPlugin, UglifyJsPlugin},
} = webpack;

export default {
  ...webpackConfig,
  output: {
    ...webpackConfig.output,
    filename: '[name].[hash]-build.js', // hash names in production
  },
  plugins: [
    new OccurenceOrderPlugin(), // spelling mistake fixed in webpack 2.0
    new UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
    ...webpackConfig.plugins,
  ],
};
