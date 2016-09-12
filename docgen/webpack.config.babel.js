import webpack from 'webpack';
import {join} from 'path';

export default {
  entry: {
    'assets/js/api': join(__dirname, 'assets/js/api.js'),
    'assets/js/examples/media': join(__dirname, 'assets/js/examples/media.js'),
    'assets/js/examples/ecommerce': join(__dirname, 'assets/js/examples/ecommerce.js'),
  },
  devtool: 'source-map',
  output: {
    path: join(__dirname, '../docs/'),
    publicPath: '/',
    filename: '[name].js',
    // @TODO: in production this should be hashed
    // filename: '[name].[chunkhash].js',
  },
  module: {
    loaders: [{
      test: /\.js$/, exclude: /node_modules/, loader: 'babel',
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
      // needed by react-instantsearch
      // @TODO: we can't ask users to do so, the default production build
      // will need to have this set to false
      '__DOC__': JSON.stringify(false),
    }),
  ],
};
