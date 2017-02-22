// this is the webpack config when running `yarn docs:build`

import webpack from 'webpack';
import webpackConfig from './webpack.config.babel.js';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';

const {
  optimize: {UglifyJsPlugin},
} = webpack;

export default {
  ...webpackConfig,
  devtool: 'source-map',
  output: {
    ...webpackConfig.output,
    filename: '[name].[hash]-build.js', // hash names in production
  },
  plugins: [
    new UglifyJsPlugin({
      sourceMap: true,
    }),
    ...webpackConfig.plugins,
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      generateStatsFile: true,
      logLevel: 'error',
    }),
  ],
};
