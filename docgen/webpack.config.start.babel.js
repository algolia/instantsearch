// this is the webpack config when running `npm start`

import webpack from 'webpack';
import webpackConfig from './webpack.config.babel.js';

const {
  HotModuleReplacementPlugin,
  NoErrorsPlugin,
} = webpack;

export default {
  ...webpackConfig,
  devtool: 'cheap-module-eval-source-map',
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
    new HotModuleReplacementPlugin(),
    new NoErrorsPlugin(),
    ...webpackConfig.plugins,
  ],
};
