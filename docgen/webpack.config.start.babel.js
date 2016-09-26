// this is the webpack config when running `npm start`

import webpack from 'webpack';
import webpackConfig from './webpack.config.babel.js';
import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin';

const {
  optimize: {OccurenceOrderPlugin},
  HotModuleReplacementPlugin,
  NoErrorsPlugin,
} = webpack;

export default {
  ...webpackConfig,
  devtool: 'eval-source-map', // a lot faster than 'source-map', not ok for production though
  entry: {
    ...(
      Object
        .entries(webpackConfig.entry)
        .reduce((memo, [entryName, entryValue]) => ({
          ...memo,
          [entryName]: [
            // this is react-hot-loader 3, current doc at
            // https://github.com/gaearon/react-hot-loader/blob/123d940ff34c3178549fec9d57b9378ff48b4841/docs/README.md
            'react-hot-loader/patch',
            'webpack-hot-middleware/client?reload=true',
            entryValue,
          ],
        }), {})
    ),
  },
  plugins: [
    new WatchMissingNodeModulesPlugin(),
    new OccurenceOrderPlugin(), // spelling mistake fixed in webpack 2.0
    new HotModuleReplacementPlugin(),
    new NoErrorsPlugin(),
    ...webpackConfig.plugins,
  ],
};
