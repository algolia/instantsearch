// this is the webpack config when running `npm run docs:build`

import webpack from 'webpack';
import webpackConfig from './webpack.config.babel.js';

export default {
  ...webpackConfig,
  output: {
    ...webpackConfig.output,
    filename: '[name].[hash]-build.js', // hash names in production
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false,
      },
      output: {
        comments: false,
        ascii_only: true,
      },
      sourceMap: true,
    }),
    ...webpackConfig.plugins,
  ],
};
