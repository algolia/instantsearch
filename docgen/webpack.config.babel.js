import webpack from 'webpack';
import {join} from 'path';
import {rootPath} from './path';

export default {
  entry: {
    'js/main': join(__dirname, 'assets/js/main.js'),
    'examples/e-commerce/index': join(__dirname, 'src/examples/e-commerce/index.js'),
    'examples/media/index': join(__dirname, 'src/examples/media/index.js'),
    'examples/tourism/index': join(__dirname, 'src/examples/tourism/index.js'),
    'examples/material-ui/index': join(__dirname, 'src/examples/material-ui/index.js'),
  },
  devtool: 'source-map',
  output: {
    path: rootPath(process.env.DOCS_DIST || 'docs/react/'),
    publicPath: process.env.DOCS_MOUNT_POINT || '/',
    filename: '[name].js',
    // @TODO: in production this should be hashed
    // filename: '[name].[chunkhash].js',
  },
  module: {
    loaders: [{
      test: /\.js$/, exclude: /node_modules/, loader: 'babel',
    }, {
      test: /\.css?$/,
      loaders: ['style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'],
    }],
  },
  resolve: {
    alias: {
      'react-instantsearch': join(__dirname, '../packages/react-instantsearch/'),
    },
  },
  // replace usage of process.env.NODE_ENV with the actual NODE_ENV from command line
  // when building. Some modules might be using it, this way we will reduce the code output when
  // NODE_ENV === 'production' and NODE_ENV=production was used to build
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
};
