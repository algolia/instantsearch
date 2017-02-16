import {join} from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import webpack from 'webpack'; // this is available because of root package.json

export default {
  entry: {
    Core: './index.js',
    Dom: './dom.js',
    Connectors: './connectors.js',
  },
  devtool: 'source-map',
  output: {
    path: join(__dirname, 'dist/umd'),
    filename: '[name].js',
    library: ['ReactInstantSearch', '[name]'],
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      {
        test: /\.js$/, exclude: /node_modules/, loader: 'babel',
      },
    ],
  },
  externals: {
    'react': {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    }, 'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
};
