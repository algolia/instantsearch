import webpackConfig from './webpack.config.babel.js';
import webpack, {HotModuleReplacementPlugin} from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

const webpackConfigForDevServer = {
  ...webpackConfig,
  devtool: 'eval-source-map',
  entry: {
    ...(
      Object
        .entries(webpackConfig.entry)
        .reduce((memo, [entryName, entryValue]) => ({
          ...memo,
          [entryName]: [
            'webpack-dev-server/client?http://localhost:8081/',
            'webpack/hot/dev-server',
            entryValue,
          ],
        }), {})
    ),
  },
  output: {
    ...webpackConfig.output,
    publicPath: 'http://localhost:8081/',
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    ...webpackConfig.plugins,
  ],
};

const compiler = webpack(webpackConfigForDevServer);
const server = new WebpackDevServer(compiler, {
  stats: {
    chunks: false,
  },
  hot: true,
  compress: true,
});
server.listen(8081);
