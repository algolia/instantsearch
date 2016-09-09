import webpack from 'webpack';
import browserSync from 'browser-sync';
import baseWebpackConfig from './webpack.config.babel.js';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {root} from './path.js';

export default function() {
  const {
    optimize: {OccurenceOrderPlugin},
    HotModuleReplacementPlugin,
    NoErrorsPlugin,
  } = webpack;

  const webpackConfig = {
    ...baseWebpackConfig,
    devtool: 'eval-source-map',
    entry: {
      ...(
        Object
          .entries(baseWebpackConfig.entry)
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
      ...baseWebpackConfig.plugins,
    ],
  };
  const compiler = webpack(webpackConfig);
  const bs = browserSync.create();
  bs.init({
    server: root('docs/'),
    open: false,
    files: `${root('docs/')}**/*`,
    watchOptions: {
      awaitWriteFinish: {
        stabilityThreshold: 150,
      },
    },
    middleware: [
      webpackDevMiddleware(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath,
      }),
      webpackHotMiddleware(compiler),
    ],
  });
}
