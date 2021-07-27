// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const nodeExternals = require('webpack-node-externals');

exports.chainWebpack = webpackConfig => {
  webpackConfig.plugins.delete('hmr');
  webpackConfig.plugins.delete('preload');
  webpackConfig.plugins.delete('prefetch');
  webpackConfig.plugins.delete('progress');
  webpackConfig.plugins.delete('friendly-errors');

  webpackConfig.plugin('define').tap(definitions => {
    // eslint-disable-next-line no-param-reassign
    definitions[0]['process.env'].SSR_TARGET = JSON.stringify(
      process.env.SSR_TARGET
    );
    return definitions;
  });

  if (process.env.SSR_TARGET === 'client') {
    webpackConfig
      .entry('app')
      .clear()
      .add('./src/entry-client.js');
  } else {
    webpackConfig
      .entry('app')
      .clear()
      .add('./src/entry-server.js');

    webpackConfig.target('node');
    webpackConfig.output.libraryTarget('commonjs2');

    webpackConfig
      .plugin('manifest')
      .use(new ManifestPlugin({ fileName: 'ssr-manifest.json' }));

    webpackConfig.externals(
      nodeExternals({
        allowlist: [
          /\.(css|vue)$/,
          /vue-instantsearch/,
          /instantsearch\.js/,
          '@vue/server-renderer',
          'qs',
          'vue-router',
        ],
      })
    );

    webpackConfig.plugin('limit').use(
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      })
    );
  }
};
