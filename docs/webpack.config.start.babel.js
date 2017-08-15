// this is the webpack config when running `npm start`

import webpack from 'webpack';
import webpackConfig from './webpack.config.babel.js';

const {
  optimize: {OccurenceOrderPlugin},
  HotModuleReplacementPlugin,
  NoErrorsPlugin,
} = webpack;

export default {
  ...webpackConfig,
  devtool: 'source-map', // a lot faster than 'source-map', not ok for production though
  entry: {
    ...(
      Object
        .entries(webpackConfig.entry)
        .reduce((memo, [entryName, entryValue]) => ({
          ...memo,
          [entryName]: [
            'webpack-hot-middleware/client?reload=true',
            entryValue,
          ],
        }), {})
    ),
  },
  plugins: [
    new OccurenceOrderPlugin(), // spelling mistake fixed in webpack 2.0
    new HotModuleReplacementPlugin(),
    new NoErrorsPlugin(),
    ...webpackConfig.plugins,
  ],
};
