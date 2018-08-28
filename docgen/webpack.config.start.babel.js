// this is the webpack config when running `npm start`

import webpack from 'webpack';
import webpackConfig from './webpack.config.babel';

const { HotModuleReplacementPlugin, NoEmitOnErrorsPlugin } = webpack;

export default {
  ...webpackConfig,
  devtool: 'cheap-module-eval-source-map',
  entry: {
    ...Object.entries(webpackConfig.entry).reduce(
      (memo, [entryName, entryValue]) => ({
        ...memo,
        [entryName]: [
          // this is react-hot-loader 3, current doc at
          // https://github.com/gaearon/react-hot-loader/blob/123d940ff34c3178549fec9d57b9378ff48b4841/docs/README.md
          'react-hot-loader/patch',
          'webpack-hot-middleware/client?reload=true',
          entryValue,
        ],
      }),
      {}
    ),
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new NoEmitOnErrorsPlugin(),
    ...webpackConfig.plugins,
  ],
};
