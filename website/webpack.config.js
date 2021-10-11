const path = require('path');
const glob = require('glob');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outputPath = __dirname;
const examples = glob.sync(
  path.join('examples', '@(default-theme|e-commerce|media|tourism)'),
  {
    cwd: path.join(__dirname, '..'),
  }
);

module.exports = {
  mode: 'production',
  entry: examples.reduce(
    (acc, example) => ({
      ...acc,
      [example]: path.join(__dirname, '..', example, 'index.js'),
    }),
    {}
  ),
  output: {
    filename: '[name]/index.[chunkhash].js',
    publicPath: '/',
    path: outputPath,
  },
  resolve: {
    alias: {
      'react-instantsearch-dom': path.resolve(
        __dirname,
        '../packages/react-instantsearch-dom'
      ),
      'react-instantsearch-dom-maps': path.resolve(
        __dirname,
        '../packages/react-instantsearch-dom-maps'
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: (filename, absolutePath, context) =>
                `/${path.relative(context, absolutePath)}`,
              context: path.join(__dirname, '..'),
              outputPath(_url, resourcePath, context) {
                return path.relative(context, resourcePath);
              },
              name: '[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  performance: {
    hints: false,
  },
  plugins: [
    ...examples.map(
      (example) =>
        new HTMLWebpackPlugin({
          template: path.join(__dirname, '..', example, 'index.html'),
          filename: path.join(outputPath, example, 'index.html'),
          chunks: [example],
        })
    ),
    new CopyWebpackPlugin([
      ...examples.map((example) => ({
        from: path.join(__dirname, '..', example, 'assets'),
        to: path.join(outputPath, example, 'assets'),
      })),
      {
        from: path.join(__dirname, '..', 'assets'),
        to: 'assets/',
      },
    ]),
  ],
};
