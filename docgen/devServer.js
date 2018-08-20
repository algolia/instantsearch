// this file will start a browsersync server that will serve /docs
// it will automatically inject any css
// it will also use webpack and watch/build/hot reload

import webpack from 'webpack';
import browserSync from 'browser-sync';
import webpackConfig from './webpack.config.start.babel';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import compression from 'compression';
import config from './config';

export default function() {
  const compiler = webpack(webpackConfig);
  const bs = browserSync.create();
  bs.init({
    server: config.docsDist,
    open: false,
    files: `${config.docsDist}/**/*`,
    watchOptions: {
      ignored: [
        /\.js$/, // any change to a JavaScript file must be ignored, webpack handles it
        /\.css\.map$/, // no need to reload the whole page for CSS source maps
      ],
      awaitWriteFinish: {
        stabilityThreshold: 150, // wait 150ms for the filesize to be stable (= write finished)
      },
    },
    notify: {
      styles: {
        bottom: 0,
        top: 'auto',
      },
    },
    middleware: [
      compression(),
      webpackDevMiddleware(compiler, {
        logLevel: 'warn',
        publicPath: webpackConfig.output.publicPath,
      }),
      webpackHotMiddleware(compiler),
    ],
  });
}
