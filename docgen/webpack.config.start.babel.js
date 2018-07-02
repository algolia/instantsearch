// this is the webpack config when running `npm start`

import webpack from 'webpack';
import webpackConfig from './webpack.config.babel';

export default {
  ...webpackConfig,
  devtool: 'eval-source-map',

  entry: {
    ...Object.entries(webpackConfig.entry).reduce(
      (memo, [entryName, entryValue]) => ({
        ...memo,
        [entryName]: ['webpack-hot-middleware/client?reload=true', entryValue]
      }),
      {}
    )
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({ debug: true }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    ...webpackConfig.plugins
  ]
};
